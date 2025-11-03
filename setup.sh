#!/bin/bash

# Insurance Claim Analysis System Setup Script

echo "🚀 Setting up Insurance Claim Analysis System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Gemini API Configuration
GEMINI_API_KEY=""

# Database Configuration
DATABASE_URL=sqlite:///./database.db

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
EOF
    echo "✅ Created .env file. Please update GEMINI_API_KEY with your actual API key."
else
    echo "✅ .env file already exists."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p Backend/uploads Backend/vector_db/chroma Backend/reports

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose up --build -d

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update GEMINI_API_KEY in .env file"
echo "   2. Restart services: docker-compose restart"
echo ""
echo "🔧 To stop services: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
