import os
import sys
import subprocess
import time

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    python_exe = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    print("==================================================")
    print("🧪 KINGDOM OF SCIENCE AI - HACKATHON LAUNCHER")
    print("==================================================")
    print("1. Starting FastAPI RAG Server on http://localhost:8000 ...")
    
    backend_process = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    print("2. Starting React Vite Frontend on http://localhost:5173 ...")
    frontend_process = subprocess.Popen(
        ["cmd", "/c", "npm", "run", "dev"],
        cwd=frontend_dir
    )

    print("\n✅ Kingdom of Science AI is running!")
    print("👉 Frontend UI: http://localhost:5173")
    print("👉 Backend API: http://localhost:8000")
    print("👉 API Docs:    http://localhost:8000/docs")
    print("\nPress Ctrl+C to terminate services.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Kingdom of Science AI servers...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    main()
