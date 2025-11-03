from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, query, report, documents, queries
from services.db_service import init_db

app = FastAPI(title="Insurance Claim Analysis System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:5173",  # Vite dev server
        "http://frontend:3000",
        # Also allow https variants commonly used in local/dev setups
        "https://localhost:3000",
        "https://localhost:5173",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include routers
app.include_router(upload.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(queries.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Insurance Claim Analysis System API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.options("/api/process-pdf")
async def options_process_pdf():
    return {"message": "CORS preflight handled"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}