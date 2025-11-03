from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import chromadb
from services.llm_service import LLMService
from services.db_service import get_db, log_query

router = APIRouter()
llm_service = LLMService()

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./vector_db/chroma")
collection = client.get_or_create_collection(name="insurance_policies")

@router.get("/query")
async def query_insurance(query: str, db: Session = Depends(get_db)):
    try:
        # Check if collection has any documents
        collection_count = collection.count()
        if collection_count == 0:
            return {
                "decision": "no_data",
                "amount": None,
                "justification": "No documents have been uploaded yet. Please upload a PDF document first.",
                "reference_clauses": []
            }

        # Generate query embedding
        query_embedding = llm_service.get_embeddings([query])[0]

        # Search for relevant documents
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3
        )

        if not results["documents"] or not results["documents"][0]:
            return {
                "decision": "no_match",
                "amount": None,
                "justification": "No relevant information found in the uploaded documents for this query.",
                "reference_clauses": []
            }

        # Analyze claim using LLM
        try:
            response = llm_service.analyze_claim(query, results["documents"][0])
        except Exception as e:
            print(f"LLM analysis error: {e}")
            response = {
                "decision": "error",
                "amount": None,
                "justification": f"Analysis failed: {str(e)}",
                "reference_clauses": []
            }

        # Log the query and response
        log_query(db, query, response)

        return response

    except Exception as e:
        print(f"Query error: {e}")
        return {
            "decision": "error",
            "amount": None,
            "justification": f"An error occurred while processing your query: {str(e)}",
            "reference_clauses": []
        }