from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import json
from datetime import datetime
from services.db_service import get_db, get_recent_queries
import os

router = APIRouter()

@router.get("/report")
async def generate_report(format: str = "pdf", db: Session = Depends(get_db)):
    # Get recent queries
    queries = get_recent_queries(db)
    
    if format.lower() == "json":
        # Return JSON report
        report_data = [{
            "query": q.query,
            "decision": q.decision,
            "amount": q.amount,
            "justification": q.justification,
            "reference_clauses": q.reference_clauses,
            "timestamp": q.timestamp.isoformat()
        } for q in queries]
        
        return report_data
    
    else:  # PDF report
        # Create reports directory if it doesn't exist
        os.makedirs("reports", exist_ok=True)
        
        # Generate PDF file
        filename = f"reports/claim_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Prepare content
        content = []
        
        # Add title
        content.append(Paragraph("Insurance Claims Analysis Report", styles['Title']))
        content.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        
        # Prepare table data
        table_data = [["Query", "Decision", "Amount", "Justification", "Reference Clauses"]]
        for query in queries:
            table_data.append([
                query.query,
                query.decision,
                query.amount or "N/A",
                query.justification,
                ", ".join(query.reference_clauses)
            ])
        
        # Create table
        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        content.append(table)
        
        # Build PDF
        doc.build(content)
        
        # Read the generated PDF
        with open(filename, "rb") as pdf_file:
            pdf_content = pdf_file.read()
        
        # Clean up file
        os.remove(filename)
        
        # Return PDF
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=claim_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            }
        )