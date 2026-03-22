from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SkillHire AI Server - Test")

# Allow Node.js backend to call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "✅ SkillHire AI Server running - TEST MODE"}

@app.get("/test")
def test():
    return {"message": "FastAPI is working! Models not loaded yet."}