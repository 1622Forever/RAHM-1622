import os
import csv
import requests
import json
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "knowledge")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_TAGS_URL = os.getenv("OLLAMA_TAGS_URL", "http://localhost:11434/api/tags")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")

# Direct Python Prompt Templates - Educational Unrestricted Mode
STANDARD_PROMPT_TEMPLATE = """You are Dr. RAHM.
You are an expert scientific survival educator.

Rules:
1. Primary Source: Prioritize retrieved scientific context whenever available.
2. Educational Breadth: If the retrieved documents do not contain complete details, draw upon foundational scientific principles to provide a thorough, accurate, step-by-step educational explanation. Never refuse to answer educational questions.
3. Always explain scientifically, clearly, and practically.
4. Follow this exact answer format.

ANSWER FORMAT:
🧪 SCIENTIFIC PRINCIPLE
Explain why it works and the underlying physical/chemical mechanisms.

══════════════════════

⚙ REQUIRED MATERIALS
List everything required.

══════════════════════

🔬 PROCEDURE
Give step-by-step instructions.

══════════════════════

⚠ SAFETY & PRECAUTIONS
Mention hazards and essential safety precautions.

══════════════════════

📚 REFERENCES & KNOWLEDGE SOURCES
Show retrieved document sources if available, or state general scientific domain principles.

══════════════════════

Difficulty
🟢 Easy / 🟡 Medium / 🔴 Advanced

Estimated Time

---

Retrieved Context:
{context}

User Question: {question}

Dr. RAHM Report:"""


RESOURCE_PLANNER_PROMPT_TEMPLATE = """You are Dr. RAHM.
You are an expert scientific survival educator.

The user has the following available materials: {resources}

Rules:
1. Primary Source: Prioritize retrieved scientific context whenever available.
2. Educational Breadth: Recommend what can be constructed, synthesized, or built using these materials, explaining the underlying scientific mechanisms clearly.
3. Provide practical, creative scientific recommendations even if documents are partial.
4. Follow this exact format.

RESOURCE PLANNER REPORT:
🛠 POSSIBLE PROJECTS
List what can be constructed or synthesized with these resources.

══════════════════════

📦 MISSING MATERIALS
List any additional materials required for higher efficiency or safety.

══════════════════════

🧪 SCIENTIFIC EXPLANATION
Explain the underlying chemical or physical principles.

══════════════════════

Difficulty
🟢 Easy / 🟡 Medium / 🔴 Advanced

Estimated Time

══════════════════════

📚 REFERENCES & KNOWLEDGE SOURCES
Show retrieved document sources or general scientific principles.

---

Retrieved Context:
{context}

Dr. RAHM Resource Plan:"""


class RAGPipeline:
    def __init__(self):
        self.embeddings = None
        self.vector_store = None
        self.indexed_files: Dict[str, Dict[str, Any]] = {}
        self.total_chunks = 0
        self._init_embeddings()

    def _init_embeddings(self):
        print("[Embeddings] Initializing SentenceTransformer embeddings (all-MiniLM-L6-v2)...")
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    def extract_and_chunk_file(self, file_path: str, filename: str) -> List[Document]:
        documents = []
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == ".pdf":
            try:
                reader = PdfReader(file_path)
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        documents.append(Document(
                            page_content=text.strip(),
                            metadata={"source": filename, "page": i + 1, "file_path": file_path}
                        ))
            except Exception as e:
                print(f"[Extractor Warning] Failed to read PDF '{filename}': {e}")
        elif ext in [".tsv", ".csv"]:
            delimiter = "\t" if ext == ".tsv" else ","
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    reader_obj = csv.reader(f, delimiter=delimiter)
                    rows = list(reader_obj)
                    if rows:
                        header = rows[0]
                        formatted_lines = []
                        # Cap large TSV preview to top 1500 rows to ensure fast startup & vectorization
                        max_rows = min(len(rows), 1500)
                        for row_idx, row in enumerate(rows[1:max_rows], start=1):
                            row_str = ", ".join([f"{header[i]}: {val}" for i, val in enumerate(row) if i < len(header)])
                            formatted_lines.append(f"Record {row_idx}: {row_str}")
                        text_content = f"Dataset File: {filename}\nHeaders: {', '.join(header)}\n" + "\n".join(formatted_lines)
                        documents.append(Document(
                            page_content=text_content,
                            metadata={"source": filename, "page": 1, "file_path": file_path}
                        ))
            except Exception as e:
                print(f"[Extractor Warning] Failed to parse TSV/CSV '{filename}': {e}")
        elif ext in [".txt", ".md"]:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text_content = f.read()
                    if text_content.strip():
                        documents.append(Document(
                            page_content=text_content.strip(),
                            metadata={"source": filename, "page": 1, "file_path": file_path}
                        ))
            except Exception as e:
                print(f"[Extractor Warning] Failed to parse text file '{filename}': {e}")
                
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        
        chunks = text_splitter.split_documents(documents)
        print(f"[File Extractor] Extracted {len(documents)} docs -> {len(chunks)} chunks for '{filename}'.")
        return chunks

    def index_file(self, file_path: str, filename: str) -> int:
        chunks = self.extract_and_chunk_file(file_path, filename)
        if not chunks:
            return 0
            
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        else:
            self.vector_store.add_documents(chunks)
            
        self.indexed_files[filename] = {
            "filename": filename,
            "file_path": file_path,
            "chunks_count": len(chunks),
            "status": "indexed"
        }
        self.total_chunks += len(chunks)
        return len(chunks)

    def index_pdf(self, file_path: str, filename: str) -> int:
        return self.index_file(file_path, filename)

    def load_knowledge_folder(self):
        os.makedirs(KNOWLEDGE_DIR, exist_ok=True)
        valid_exts = (".pdf", ".tsv", ".csv", ".txt", ".md")
        files = [f for f in os.listdir(KNOWLEDGE_DIR) if f.lower().endswith(valid_exts)]
        print(f"[RAG] Scanning knowledge directory: found {len(files)} files: {files}")
        
        total_added = 0
        for fname in files:
            fpath = os.path.join(KNOWLEDGE_DIR, fname)
            count = self.index_file(fpath, fname)
            total_added += count
            
        print(f"[FAISS] Vectorstore initialized with {total_added} chunks across {len(self.indexed_files)} files.")

    def get_indexed_documents(self) -> List[Dict[str, Any]]:
        return list(self.indexed_files.values())

    def retrieve_context(self, query: str, top_k: int = 4) -> Tuple[str, List[Dict[str, Any]]]:
        if self.vector_store is None or not self.indexed_files:
            return "", []
            
        results = self.vector_store.similarity_search_with_score(query, k=top_k)
        
        context_blocks = []
        citations = []
        
        for doc, score in results:
            source = doc.metadata.get("source", "Unknown.pdf")
            page = doc.metadata.get("page", 1)
            content = doc.page_content
            
            context_blocks.append(f"[Document: {source} | Page: {page}]\n{content}")
            
            citations.append({
                "source": source,
                "page": page,
                "excerpt": content,
                "score": round(float(score), 4)
            })
            
        formatted_context = "\n\n".join(context_blocks)
        return formatted_context, citations

    def get_available_ollama_models(self) -> List[str]:
        try:
            res = requests.get(OLLAMA_TAGS_URL, timeout=3)
            if res.status_code == 200:
                models_data = res.json().get("models", [])
                return [m.get("name") for m in models_data if m.get("name")]
        except Exception:
            pass
        return []

    def call_ollama_gemma(self, prompt: str) -> str:
        available_models = self.get_available_ollama_models()
        print(f"[Ollama Status] Available local models: {available_models}")
        
        candidate_models = ["gemma2:2b", "gemma4:12b", "gemma:2b", "gemma", "llama3", "mistral"]
        
        for m in available_models:
            if m not in candidate_models:
                candidate_models.insert(0, m)
            else:
                candidate_models.remove(m)
                candidate_models.insert(0, m)

        for model_name in candidate_models:
            try:
                payload = {
                    "model": model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3
                    }
                }
                print(f"[Ollama Exec] Requesting response from model '{model_name}'...")
                response = requests.post(OLLAMA_URL, json=payload, timeout=120)
                if response.status_code == 200:
                    result = response.json()
                    ans = result.get("response", "").strip()
                    if ans:
                        print(f"[Ollama Exec] Successfully generated {len(ans)} chars from model '{model_name}'.")
                        return ans
            except Exception as e:
                print(f"[Ollama Exec] Model '{model_name}' failed: {e}")
                continue

        return "Gemma is not running. Please start Ollama."

    def query_rag(self, user_question: str) -> Dict[str, Any]:
        context, citations = self.retrieve_context(user_question, top_k=4)
        
        if not context:
            context = "No specific document excerpt retrieved. Applying Dr. RAHM General Scientific Principles."
            
        prompt = STANDARD_PROMPT_TEMPLATE.format(context=context, question=user_question)
        answer = self.call_ollama_gemma(prompt)
        
        return {
            "answer": answer,
            "citations": citations
        }

    def plan_resources(self, resources_list: List[str]) -> Dict[str, Any]:
        resources_str = ", ".join(resources_list)
        search_query = f"What can be built, constructed, or synthesized using materials: {resources_str}?"
        
        context, citations = self.retrieve_context(search_query, top_k=5)
        
        if not context:
            context = "No specific document excerpt retrieved. Applying Dr. RAHM General Scientific Principles."
            
        prompt = RESOURCE_PLANNER_PROMPT_TEMPLATE.format(context=context, resources=resources_str)
        answer = self.call_ollama_gemma(prompt)
        
        return {
            "answer": answer,
            "citations": citations
        }

rag_pipeline = RAGPipeline()
