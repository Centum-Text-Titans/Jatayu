import os
import PyPDF2
from django.conf import settings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings


# Global index path
index_path = os.path.join(settings.BASE_DIR, "ml_models", "model_weights","faiss")

def extract_context_from_pdf(pdf_path: str) -> str:
    reader = PyPDF2.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
        text += "\n"
    return text

def get_text_chunks(text: str):
    splitter = RecursiveCharacterTextSplitter(
        separators=["\n"],
        chunk_size=10_000,
        chunk_overlap=1_000
    )
    return splitter.split_text(text)

def build_faiss_index_from_pdf(pdf_path: str):
    text = extract_context_from_pdf(pdf_path)
    chunks = get_text_chunks(text)
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(chunks, embedding=embeddings)
    vector_store.save_local(index_path)
    return len(chunks)
