@echo off
echo 🚀 Setting up Insurance Claim Analysis System...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Gemini API Configuration
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # Database Configuration
        echo DATABASE_URL=sqlite:///./database.db
        echo.
        echo # API Configuration
        echo VITE_API_BASE_URL=http://localhost:8000
    ) > .env
    echo ✅ Created .env file. Please update GEMINI_API_KEY with your actual API key.
) else (
    echo ✅ .env file already exists.
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "Backend\uploads" mkdir "Backend\uploads"
if not exist "Backend\vector_db\chroma" mkdir "Backend\vector_db\chroma"
if not exist "Backend\reports" mkdir "Backend\reports"

REM Build and start services
echo 🐳 Building and starting Docker services...
docker-compose up --build -d

echo ✅ Setup complete!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Documentation: http://localhost:8000/docs
echo.
echo 📝 Don't forget to:
echo    1. Update GEMINI_API_KEY in .env file
echo    2. Restart services: docker-compose restart
echo.
echo 🔧 To stop services: docker-compose down
echo 📊 To view logs: docker-compose logs -f
pause
