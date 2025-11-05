from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db_service import get_db, create_query, get_queries_by_document, get_recent_queries

router = APIRouter()


@router.post("/queries")
def create_q(payload: dict, db: Session = Depends(get_db)):
    document_id = payload.get('document_id')
    query_text = payload.get('query_text')
    response = payload.get('response')
    raw_context = payload.get('raw_context')
    raw_response = payload.get('raw_response')
    q = create_query(db, document_id=document_id, query_text=query_text, response=response, raw_context=raw_context, raw_response=raw_response)
    return {"id": q.id, "document_id": q.document_id, "query_text": q.query, "decision": q.decision, "amount": q.amount, "justification": q.justification, "reference_clauses": q.reference_clauses, "timestamp": q.timestamp.isoformat()}


@router.get("/queries")
def get_all_queries(db: Session = Depends(get_db)):
    """Get all queries for analytics"""
    qs = get_recent_queries(db, limit=1000)  # Get more queries for analytics
    return [{"id": q.id, "document_id": q.document_id, "query_text": q.query, "decision": q.decision, "amount": q.amount, "justification": q.justification, "reference_clauses": q.reference_clauses, "timestamp": q.timestamp.isoformat()} for q in qs]


@router.get("/documents/{doc_id}/queries")
def list_queries(doc_id: int, db: Session = Depends(get_db)):
    qs = get_queries_by_document(db, doc_id)
    return [{"id": q.id, "document_id": q.document_id, "query_text": q.query, "decision": q.decision, "amount": q.amount, "justification": q.justification, "reference_clauses": q.reference_clauses, "timestamp": q.timestamp.isoformat()} for q in qs]
