from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ---------------------------
# ✅ Database Path Configuration
# ---------------------------
# Get current directory (Backend/services)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Target database path in Backend/
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "database.db"))

# Ensure directory exists before creating DB
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# SQLite connection URL - use forward slashes for SQLite
DATABASE_URL = f"sqlite:///{DB_PATH.replace(os.sep, '/')}"

# Base model declaration
Base = declarative_base()
# ---------------------------
# ✅ Models
# ---------------------------
class QueryLog(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, nullable=True)
    query = Column(String)
    decision = Column(String)
    amount = Column(String, nullable=True)
    justification = Column(String)
    reference_clauses = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    status = Column(String, default='processing')
    summary = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

# ---------------------------
# ✅ Engine & Session
# ---------------------------
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------
# ✅ Helper Functions
# ---------------------------
def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def log_query(db, query: str, response: dict):
    query_log = QueryLog(
        query=query,
        decision=response["decision"],
        amount=response.get("amount"),
        justification=response["justification"],
        reference_clauses=response["reference_clauses"]
    )
    db.add(query_log)
    db.commit()
    db.refresh(query_log)
    return query_log


def get_recent_queries(db, limit: int = 10):
    return db.query(QueryLog).order_by(QueryLog.timestamp.desc()).limit(limit).all()


# ---------------------------
# ✅ Document Helpers
# ---------------------------
def create_document(db, name: str, file_path: str = None, file_size: int = None, status: str = 'processing'):
    doc = Document(
        name=name,
        file_path=file_path,
        file_size=file_size,
        status=status,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_documents(db):
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()


def get_document_by_id(db, doc_id: int):
    return db.query(Document).filter(Document.id == doc_id).first()


def update_document(db, doc_id: int, updates: dict):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return None
    for k, v in updates.items():
        setattr(doc, k, v)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def delete_document(db, doc_id: int):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return False
    db.delete(doc)
    db.commit()
    return True


# ---------------------------
# ✅ Query Helpers
# ---------------------------
def create_query(db, document_id: int | None, query_text: str, response: dict):
    q = QueryLog(
        document_id=str(document_id) if document_id is not None else None,
        query=query_text,
        decision=response.get('decision'),
        amount=response.get('amount'),
        justification=response.get('justification'),
        reference_clauses=response.get('reference_clauses', []),
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


def get_queries_by_document(db, document_id: int):
    return db.query(QueryLog).filter(QueryLog.document_id == str(document_id)).order_by(QueryLog.timestamp.desc()).all()
