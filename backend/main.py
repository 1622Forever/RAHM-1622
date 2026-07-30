import os
import shutil
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from rag_pipeline import rag_pipeline, OLLAMA_URL, OLLAMA_MODEL, KNOWLEDGE_DIR

app = FastAPI(
    title="Dr. RAHM API",
    description="Scientific Survival RAG Backend powered by FAISS & Ollama Gemma",
    version="1.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

class ResourcePlanRequest(BaseModel):
    resources: List[str]

@app.on_event("startup")
async def startup_event():
    print("[STARTUP] Starting Kingdom of Science AI Backend...")
    # Automatically scan backend/knowledge/ folder and index every PDF found
    rag_pipeline.load_knowledge_folder()

@app.get("/health")
def health_check():
    ollama_active = False
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=2)
        if res.status_code == 200:
            ollama_active = True
    except Exception:
        ollama_active = False
        
    return {
        "status": "online",
        "service": "Dr. RAHM Science Engine",
        "ollama_connected": ollama_active,
        "model": OLLAMA_MODEL,
        "indexed_documents_count": len(rag_pipeline.indexed_files),
        "total_chunks": rag_pipeline.total_chunks,
        "has_knowledge_base": len(rag_pipeline.indexed_files) > 0
    }

@app.get("/documents")
def get_documents():
    return {
        "documents": rag_pipeline.get_indexed_documents(),
        "total_chunks": rag_pipeline.total_chunks,
        "has_knowledge_base": len(rag_pipeline.indexed_files) > 0
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    valid_exts = (".pdf", ".tsv", ".csv", ".txt", ".md")
    if not file.filename.lower().endswith(valid_exts):
        raise HTTPException(status_code=400, detail="Accepted file types: PDF, TSV, CSV, TXT, MD.")
        
    os.makedirs(KNOWLEDGE_DIR, exist_ok=True)
    file_path = os.path.join(KNOWLEDGE_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    print(f"[UPLOAD] Received file upload: {file.filename}")
    chunks_count = rag_pipeline.index_file(file_path, file.filename)
    
    return {
        "filename": file.filename,
        "chunks_extracted": chunks_count,
        "status": "Completed",
        "message": f"Successfully indexed '{file.filename}' into FAISS vector database."
    }

@app.post("/query")
def query_knowledge_base(request: QueryRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    print(f"[QUERY] RAG Query received: {request.question}")
    result = rag_pipeline.query_rag(request.question)
    return result

@app.post("/plan")
def plan_resource_projects(request: ResourcePlanRequest):
    if not request.resources:
        raise HTTPException(status_code=400, detail="Resource list cannot be empty.")
        
    print(f"[PLANNER] Resource Plan requested for: {request.resources}")
    result = rag_pipeline.plan_resources(request.resources)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
