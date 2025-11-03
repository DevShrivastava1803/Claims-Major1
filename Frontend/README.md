# AI Insurance Claim Processing System

A modern, production-ready React application for AI-powered insurance claim processing and analysis using large language models.

## Features

### Core Functionality
- **Document Upload**: Drag-and-drop PDF upload with real-time progress tracking
- **AI Query Interface**: Natural language queries about insurance policies
- **Document Management**: Comprehensive document explorer with grid/list views
- **Analytics Dashboard**: Interactive charts and insights for claim processing
- **Real-time Processing**: Instant AI analysis and decision-making

### Technical Highlights
- **Modern React**: Built with React 18+ and functional components
- **Type-Safe**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for 60fps animations
- **State Management**: Zustand for lightweight global state
- **Database**: Supabase for persistent data storage
- **API Integration**: Axios with interceptors and error handling

## Design System

### Color Palette
- **Primary**: #000000 (Text, navigation, background accents)
- **Secondary**: #839788 (Primary buttons, highlights)
- **Accent**: #BFD7EA (Focus elements, cards)
- **Support**: #BAA898 (Secondary buttons, shadows)
- **Background**: #EEE0CB (Main page background)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Line height 1.2
- **Body Text**: Line height 1.5

## Project Structure

```
src/
├── components/
│   ├── layout/          # Navigation, footer, layout
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Library configurations (Axios, Supabase)
├── pages/               # Route components
├── services/            # API and database services
├── store/               # Zustand state management
└── types/               # TypeScript type definitions
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```

4. Add your environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:8000
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Database Schema

### Documents Table
- `id`: UUID (Primary Key)
- `name`: Text (Filename)
- `file_url`: Text (Storage URL)
- `file_size`: BigInt (File size in bytes)
- `status`: Text (processing, completed, failed)
- `summary`: Text (AI-generated summary)
- `uploaded_at`: Timestamp
- `processed_at`: Timestamp

### Queries Table
- `id`: UUID (Primary Key)
- `document_id`: UUID (Foreign Key)
- `query_text`: Text (User's question)
- `decision`: Text (approved, rejected)
- `claim_amount`: Decimal (Claimed amount)
- `justification`: Text (AI reasoning)
- `policy_clauses`: Text Array (Referenced clauses)
- `created_at`: Timestamp

## API Endpoints

### Document Processing
- `POST /upload/` - Upload PDF document
- `POST /process-pdf/?pdf_url=` - Process uploaded PDF

### Query System
- `GET /query/?query=` - Query document with natural language

## Pages Overview

### Landing Page (`/`)
- Hero section with animated elements
- Feature highlights
- Benefits showcase
- Call-to-action buttons

### Upload Page (`/upload`)
- Drag-and-drop file upload
- File validation (PDF only, 10MB max)
- Real-time upload progress
- Processing status tracking

### Query Page (`/query`)
- Natural language input field
- Sample query suggestions
- AI decision display with justification
- Policy clause references
- Query history

### Document Explorer (`/documents`)
- Grid and list view modes
- Document search and filtering
- Document details modal
- Delete and reanalyze actions

### Analytics Dashboard (`/insights`)
- Summary statistics cards
- Bar chart for approvals vs rejections
- Pie chart for claim distribution
- Line chart for trends over time
- Export functionality

## Component Library

### UI Components
- **Button**: Multiple variants and sizes with loading states
- **Card**: Flexible card component with header, content, footer
- **Input**: Enhanced input with labels, icons, and error states
- **Modal**: Accessible modal with keyboard support
- **Badge**: Status indicators with color variants
- **Skeleton**: Loading placeholders for better UX
- **ErrorBoundary**: Graceful error handling

## Accessibility Features
- WCAG 2.1 AA compliant
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- Reduced motion support

## Performance Optimizations
- Lazy loading for routes
- Code splitting for heavy libraries
- Image optimization
- Request memoization
- Debounced search inputs
- 60fps animations

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

### Frontend
- React 18.3
- TypeScript 5.5
- Vite 5.4
- Tailwind CSS 3.4
- Framer Motion 11.0
- React Router 6.22

### State & Data
- Zustand 4.5
- Axios 1.6
- Supabase JS 2.57
- React Hook Form 7.50

### UI & Visualization
- Lucide React 0.344
- Recharts 2.12
- React Hot Toast 2.4
- React Dropzone 14.2

## Development Guidelines

### Code Style
- Use functional components and hooks
- Follow single responsibility principle
- Keep files under 300 lines when possible
- Use meaningful variable and function names
- Add TypeScript types for all props and functions

### Git Workflow
- Create feature branches from main
- Write descriptive commit messages
- Test before pushing
- Keep commits focused and atomic

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
