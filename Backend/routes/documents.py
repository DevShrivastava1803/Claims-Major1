from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.db_service import get_db, create_document, get_documents, get_document_by_id, update_document, delete_document

NOT_FOUND = "Document not found"

router = APIRouter()


@router.post("/documents")
def create_doc(payload: dict, db: Session = Depends(get_db)):
    name = payload.get('name')
    file_path = payload.get('file_path')
    file_size = payload.get('file_size')
    doc = create_document(db, name=name, file_path=file_path, file_size=file_size, status='completed')
    return {"id": doc.id, "name": doc.name, "file_size": doc.file_size, "status": doc.status, "uploaded_at": doc.uploaded_at.isoformat(), "processed_at": doc.processed_at.isoformat() if doc.processed_at else None}


@router.get("/documents")
def list_docs(db: Session = Depends(get_db)):
    docs = get_documents(db)
    return [{"id": d.id, "name": d.name, "file_size": d.file_size, "status": d.status, "uploaded_at": d.uploaded_at.isoformat(), "processed_at": d.processed_at.isoformat() if d.processed_at else None} for d in docs]


@router.get("/documents/{doc_id}")
def get_doc(doc_id: int, db: Session = Depends(get_db)):
    doc = get_document_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return {"id": doc.id, "name": doc.name, "file_size": doc.file_size, "status": doc.status, "uploaded_at": doc.uploaded_at.isoformat(), "processed_at": doc.processed_at.isoformat() if doc.processed_at else None}


@router.put("/documents/{doc_id}")
def put_doc(doc_id: int, updates: dict, db: Session = Depends(get_db)):
    doc = update_document(db, doc_id, updates)
    if not doc:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return {"id": doc.id, "name": doc.name, "file_size": doc.file_size, "status": doc.status, "uploaded_at": doc.uploaded_at.isoformat(), "processed_at": doc.processed_at.isoformat() if doc.processed_at else None}


@router.delete("/documents/{doc_id}")
def del_doc(doc_id: int, db: Session = Depends(get_db)):
    ok = delete_document(db, doc_id)
    if not ok:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return {"success": True}
