from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb
import os
import shutil
from services.llm_service import LLMService
from services.db_service import create_document, update_document, get_db
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import aiofiles

router = APIRouter()
llm_service = LLMService()

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./vector_db/chroma")
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

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(pages)

        # Process chunks and store in ChromaDB
        texts = [chunk.page_content for chunk in chunks]
        embeddings = llm_service.get_embeddings(texts)

        # Add to ChromaDB with unique IDs to avoid duplicate insert errors on re-uploads
        unique_prefix = f"doc{doc.id}_{int(datetime.now(timezone.utc).timestamp())}"
        for i, (text, embedding) in enumerate(zip(texts, embeddings)):
            collection.add(
                documents=[text],
                embeddings=[embedding],
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