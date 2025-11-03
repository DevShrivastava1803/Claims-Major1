# Insurance Claim Analysis System – AI-Powered Document Understanding Platform

A fully functional AI-powered web application that allows users to upload insurance policy documents and ask natural language questions to get structured, explainable responses about claim decisions.

## 🧠 Functional Overview

This system provides:
- **Document Upload**: Upload insurance policy documents (PDFs)
- **AI-Powered Analysis**: Ask natural language questions about policy coverage
- **Structured Responses**: Get decisions with justification and reference clauses
- **Report Generation**: Download PDF reports of queries and outcomes
- **Query History**: Track all previous queries and decisions

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with modular structure
- **Document Processing**: LangChain's PyPDFLoader for PDF parsing
- **AI Integration**: Google Gemini embeddings and LLM
- **Vector Database**: ChromaDB for semantic search
- **Database**: SQLite with SQLAlchemy for logging
- **Report Generation**: ReportLab for PDF reports

### Frontend (React + TailwindCSS)
- **Framework**: React with TypeScript
- **Styling**: TailwindCSS for responsive design
- **State Management**: Zustand for global state
- **HTTP Client**: Axios for API communication
- **UI Components**: Custom components with Framer Motion animations

### Database & Storage
- **SQLite**: For logging queries, documents, and user history
- **ChromaDB**: For semantic embeddings and document vector storage
- **File Storage**: Local storage in `/uploads` directory
- **Reports**: Generated reports stored in `/reports` directory

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Google Gemini API key

### Environment Setup

1. **Create environment file**:
   ```bash
   # Create .env file in the project root
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   ```

2. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

### Running with Docker

1. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. **Stop the services**:
   ```bash
   docker-compose down
   ```

### Development Setup (Without Docker)

#### Backend Setup
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

## 📁 Project Structure

```
├── Backend/                    # FastAPI backend
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container configuration
│   ├── routes/               # API route handlers
│   │   ├── upload.py         # Document upload endpoints
│   │   ├── query.py          # Query processing endpoints
│   │   ├── report.py         # Report generation endpoints
│   │   ├── documents.py      # Document management endpoints
│   │   └── queries.py        # Query history endpoints
│   ├── services/             # Business logic services
│   │   ├── db_service.py     # Database operations
│   │   └── llm_service.py    # AI/LLM integration
│   ├── uploads/              # Uploaded documents storage
│   ├── vector_db/            # ChromaDB vector storage
│   └── reports/              # Generated reports storage
├── Frontend/                  # React frontend
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── store/            # State management
│   │   └── types/            # TypeScript type definitions
│   ├── package.json          # Node.js dependencies
│   ├── Dockerfile            # Frontend container configuration
│   └── nginx.conf            # Nginx configuration
├── docker-compose.yml        # Docker Compose configuration
└── README.md                # This file
```

## 🔌 API Endpoints

### Document Management
- `POST /api/process-pdf` - Upload and process PDF documents
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get specific document
- `DELETE /api/documents/{id}` - Delete document

### Query Processing
- `GET /api/query?query={text}` - Process natural language queries
- `GET /api/documents/{id}/queries` - Get query history for document

### Reports
- `GET /api/report?format=pdf` - Generate PDF report
- `GET /api/report?format=json` - Generate JSON report

## 🎯 Usage Examples

### 1. Upload a Policy Document
1. Navigate to http://localhost:3000/upload
2. Drag and drop a PDF policy document
3. Wait for processing to complete

### 2. Ask Questions About the Policy
1. Go to http://localhost:3000/query
2. Ask questions like:
   - "Is hospitalization covered under this policy?"
   - "What is the claim process for dental treatment?"
   - "Does the policy cover pre-existing conditions?"
   - "What is the maximum claim amount allowed?"

### 3. View Query History
- All queries are automatically saved
- View history in the Query page
- Download reports for analysis

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `DATABASE_URL` | SQLite database URL | `sqlite:///./database.db` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

### Docker Configuration

The application uses Docker Compose with the following services:
- **backend**: FastAPI application (port 8000)
- **frontend**: React application with Nginx (port 3000)

## 🔧 Troubleshooting

### Common Issues

1. **API Key Not Set**:
   ```
   ValueError: GEMINI_API_KEY environment variable is required
   ```
   Solution: Set the `GEMINI_API_KEY` in your `.env` file

2. **CORS Errors**:
   ```
   Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   Solution: Ensure both services are running and CORS is properly configured

3. **File Upload Issues**:
   - Ensure file is PDF format
   - Check file size (max 10MB)
   - Verify backend is running

4. **Database Issues**:
   - Check if SQLite database is created
   - Verify file permissions
   - Check Docker volume mounts

### Logs and Debugging

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## 🧪 Testing

### Manual Testing
1. Upload a sample PDF policy document
2. Ask various questions about coverage
3. Verify responses include decision, justification, and references
4. Check query history is saved
5. Test report generation

### API Testing
```bash
# Test backend health
curl http://localhost:8000/

# Test document upload
curl -X POST -F "file=@policy.pdf" http://localhost:8000/api/process-pdf

# Test query
curl "http://localhost:8000/api/query?query=Is%20hospitalization%20covered?"
```

## 📊 Features

### ✅ Implemented Features
- [x] PDF document upload and processing
- [x] AI-powered semantic search
- [x] Natural language query processing
- [x] Structured response generation
- [x] Query history tracking
- [x] PDF report generation
- [x] Responsive web interface
- [x] Docker containerization
- [x] Database persistence
- [x] Error handling and validation

### 🎨 UI/UX Features

## 🗂️ Git Setup & Workflow

### Initialize Git (if not already)
```bash
git init
```

### Verify Status
```bash
git status
```

### .gitignore Overview
The project root contains a `.gitignore` covering:
- Python artifacts: `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`
- Node artifacts: `Frontend/node_modules/`, `Frontend/dist/`
- Environment files: `.env`, `Backend/.env`, `Frontend/.env`
- Local data: `Backend/uploads/`, `Backend/vector_db/`, `Backend/reports/`, `Backend/database.db`
- Editor/OS files: `.idea/`, `.vscode/`, `.DS_Store`, `Thumbs.db`

### Suggested Commit Workflow
- Stage changes: `git add <files>` or `git add .`
- Review staged files: `git status`
- Commit with a clear message:
```bash
git commit -m "feat: set up git, add root .gitignore, update docs"
```

### Branching (optional)
```bash
git checkout -b feature/<short-description>
```

### Remote Setup (optional)
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

### Documentation
This README now includes:
- Project overview and architecture
- Setup instructions (Docker and local dev)
- API endpoints and testing tips
- Troubleshooting guide
- Git setup and `.gitignore` details

- [x] Modern, responsive design
- [x] Drag & drop file upload
- [x] Real-time progress indicators
- [x] Animated transitions
- [x] Loading states
- [x] Error handling
- [x] Mobile-friendly interface

## 🚀 Deployment

### Production Deployment
1. Set up production environment variables
2. Configure reverse proxy (Nginx)
3. Set up SSL certificates
4. Configure database backups
5. Set up monitoring and logging

### Cloud Deployment
- **AWS**: Use ECS or EKS with RDS
- **Google Cloud**: Use Cloud Run with Cloud SQL
- **Azure**: Use Container Instances with Azure Database

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check Docker logs for errors
4. Ensure all environment variables are set correctly

