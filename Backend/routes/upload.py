from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.retrieval_service import build_text_splitter, guess_section_name
import chromadb
import os
import shutil
from services.llm_service import LLMService
from chromadb.config import Settings
from services.db_service import create_document, update_document, get_db
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import aiofiles

router = APIRouter()
llm_service = LLMService()

# Initialize ChromaDB (disable anonymized telemetry to avoid PostHog atexit issues)
client = chromadb.PersistentClient(path="./vector_db/chroma", settings=Settings(anonymized_telemetry=False))
collection = client.get_or_create_collection(name="insurance_policies")

@router.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Save uploaded file
        os.makedirs('uploads', exist_ok=True)
        file_path = f"uploads/{int(datetime.now(timezone.utc).timestamp())}_{file.filename}"
        # Write uploaded file asynchronously
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        # Create document record in DB (status=processing)
        doc = create_document(db, name=file.filename, file_path=file_path, file_size=None, status='processing')

        # Load and process PDF
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        # Split text into chunks (updated overlap)
        text_splitter = build_text_splitter()
        chunks = text_splitter.split_documents(pages)

        # Process chunks and store in ChromaDB with metadata
        texts = [chunk.page_content for chunk in chunks]
        embeddings = llm_service.get_embeddings(texts)

        # Add to ChromaDB with unique IDs to avoid duplicate insert errors on re-uploads
        unique_prefix = f"doc{doc.id}_{int(datetime.now(timezone.utc).timestamp())}"
        for i, (text, embedding, chunk) in enumerate(zip(texts, embeddings, chunks)):
            # Build metadata without None values (Chroma rejects None in metadatas)
            meta = {
                "doc_id": doc.id,
                "chunk_index": i,
            }
            page_num = chunk.metadata.get("page")
            if page_num is not None:
                meta["page_number"] = page_num
            section = guess_section_name(text)
            if section:
                meta["section_name"] = section
            collection.add(
                documents=[text],
                embeddings=[embedding],
                metadatas=[meta],
                ids=[f"{unique_prefix}_chunk_{i}"]
            )

        # Update document status and processed_at
        update_document(db, doc.id, {"status": "completed", "processed_at": datetime.now(timezone.utc)})

        return {"message": "File processed and embeddings stored successfully", "document": {"id": doc.id, "name": doc.name, "file_size": doc.file_size, "status": "completed", "uploaded_at": doc.uploaded_at.isoformat(), "processed_at": datetime.now(timezone.utc).isoformat()}}

    except Exception as e:
        # Update document status to failed
        if 'doc' in locals():
            update_document(db, doc.id, {"status": "failed"})
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up uploaded file only if processing failed
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass  # Ignore cleanup errors