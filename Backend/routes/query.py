from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import chromadb
from services.llm_service import LLMService
from services.retrieval_service import build_context_and_refs
import re

def build_clause_details(context: str, reference_clauses: list[str]) -> list[dict]:
    """Create clause details by finding clause labels in the stitched context.
    Falls back gracefully when labels are not found.
    """
    details = []
    seen = set()
    for clause in reference_clauses or []:
        label = clause
        if not label or label in seen:
            continue
        seen.add(label)
        snippet = None
        try:
            # Find 'Clause 14' or similar occurrences and take a short snippet after
            m = re.search(rf"{re.escape(label)}[:\s\-]*", context, re.IGNORECASE)
            if m:
                start = m.end()
                window = context[start:start+400]
                # Cut at sentence boundary if possible
                end_match = re.search(r"[\.\!?]\s", window)
                if end_match:
                    snippet = window[:end_match.end()].strip()
                else:
                    snippet = window.strip()
                if snippet and len(snippet) > 380:
                    snippet = snippet[:380] + "…"
        except Exception:
            pass
        details.append({
            "label": label,
            "snippet": snippet or "Relevant excerpt not found in source; refer to document context.",
        })
    return details
from services.db_service import get_db, log_query
from chromadb.config import Settings

router = APIRouter()
llm_service = LLMService()

# Initialize ChromaDB (disable anonymized telemetry to avoid PostHog atexit issues)
client = chromadb.PersistentClient(path="./vector_db/chroma", settings=Settings(anonymized_telemetry=False))
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

        # Search for relevant documents with broader context
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=8,
            # 'ids' is always returned and is not a valid include option
            include=["documents", "metadatas"]
        )

        if not results["documents"] or not results["documents"][0]:
            return {
                "decision": "no_match",
                "amount": None,
                "justification": "No relevant information found in the uploaded documents for this query.",
                "reference_clauses": []
            }

        # Build stitched context and references (plus rich details)
        context, references, ref_details = build_context_and_refs(results, collection)

        # Analyze claim using LLM with optimized prompt
        try:
            response = llm_service.analyze_claim(query, context, references)
        except Exception as e:
            print(f"LLM analysis error: {e}")
            response = {
                "decision": "error",
                "amount": None,
                "justification": f"Analysis failed: {str(e)}",
                "reference_clauses": references
            }

        # Enrich response with structured reference details
        try:
            clause_details = build_clause_details(context, response.get("reference_clauses", []))
        except Exception:
            clause_details = []
        # Merge clause-specific details with retrieval-based details, dedup by label
        merged_details = []
        seen_labels = set()
        for d in (clause_details + ref_details):
            lbl = d.get("label")
            if not lbl:
                continue
            if lbl in seen_labels:
                continue
            seen_labels.add(lbl)
            merged_details.append({"label": lbl, "snippet": d.get("snippet")})
        response["reference_details"] = merged_details

        # Log the query and response
        raw_resp = getattr(llm_service, "last_raw_output", None)
        log_query(db, query, response, raw_context=context, raw_response=raw_resp)

        return response

    except Exception as e:
        print(f"Query error: {e}")
        return {
            "decision": "error",
            "amount": None,
            "justification": f"An error occurred while processing your query: {str(e)}",
            "reference_clauses": []
        }