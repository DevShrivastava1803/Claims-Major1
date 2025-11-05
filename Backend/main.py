from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, query, report, documents, queries
from services.db_service import init_db

app = FastAPI(title="Insurance Claim Analysis System")

# -----------------------------
# ✅ CORS Configuration
# -----------------------------
# This allows both local development and Render-deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local dev (React/Vite)
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://localhost:3000",
        "https://localhost:5173",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:5173",

        # Docker internal network
        "http://frontend:3000",

        # Render frontend domain
        "https://claims-major1-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# ✅ Initialize Database
# -----------------------------
init_db()

# -----------------------------
# ✅ Include Routers
# -----------------------------
app.include_router(upload.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(queries.router, prefix="/api")

# -----------------------------
# ✅ Root Endpoint
# -----------------------------
@app.get("/")
async def root():
    return {
        "message": "Insurance Claim Analysis System API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# -----------------------------
# ✅ Handle CORS Preflight Requests
# -----------------------------
@app.options("/api/process-pdf")
async def options_process_pdf():
    return {"message": "CORS preflight handled"}

# -----------------------------
# ✅ Health Check (GET + HEAD)
# -----------------------------
@app.api_route("/api/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}
