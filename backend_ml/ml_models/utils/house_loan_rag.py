import os
import re
import json
from dotenv import load_dotenv
from django.conf import settings
import google.generativeai as genai
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

# Load API Key from .env file and configure the Gemini LLM.
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
llm = ChatGoogleGenerativeAI( model="gemini-2.0-flash",  client=genai,  temperature=0.1,   top_k=10  )
LOCAL_SCHEMA_COLUMNS = ["CustomerID", "CustomerName", "Tenure", "Age", "Gender", "MaritalStatus", "AnnualIncome", "MonthlyIncome", "CreditScore", "EmploymentStatus", "EducationLevel", "Experience", "LoanAmount", "LoanDuration", "NumberOfDependents", "HomeOwnershipStatus", "MonthlyDebtPayments", "CreditCardUtilizationRate", "NumberOfOpenCreditLines", "NumberOfCreditInquiries", "DebtToIncomeRatio", "BankruptcyHistory", "LoanPurpose", "PreviousLoanDefaults", "PaymentHistory", "LengthOfCreditHistory", "SavingsAccountBalance", "CheckingAccountBalance", "TotalAssets", "TotalLiabilities", "UtilityBillsPaymentHistory", "JobTenure", "NetWorth", "BaseInterestRate", "InterestRate", "MonthlyLoanPayment", "TotalDebtToIncomeRatio", "Geography", "NumOfProducts", "HasCrCard", "IsActiveMember"]






# Global index path
index_path = os.path.join(settings.BASE_DIR, "ml_models", "model_weights","faiss")


# ─── 3) RAG QA CHAIN ────────────────────────────────────────────────────────────
def get_conversational_chain():
    prompt_template = """
You are a data assistant. Use the provided context (from CSV/PDF) to answer the user’s question.
If the answer isn’t in the context, say you don’t know.

Context:
{context}

Question:
{question}

Answer:
"""
   
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    return load_qa_chain(llm=llm, chain_type="stuff", prompt=prompt)

def user_input(question: str ) -> str:
    index_path1 = os.path.join(index_path)
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    db = FAISS.load_local(index_path1, embeddings, allow_dangerous_deserialization=True)
    docs = db.similarity_search(question, top_k=10)
    chain = get_conversational_chain()
    resp = chain({"input_documents": docs, "question": question}, return_only_outputs=True)
    return resp.get("output_text", "")


# ─── 4) RAG FALLBACK FOR CRS/RAS ────────────────────────────────────────────────
def rag_predict_scores(input_data1: dict, input_data2: dict) -> dict:
    combined_data = {**input_data1, **input_data2}
    fields = "\n".join(f"- {k}: {v!r}" for k, v in combined_data.items())
    question = f"""
Given the following customer data, please estimate Customer Relation Strength (CRS) and Risk Assessment Score (RAS) as float percentages.
Return exactly this JSON:
{{
  "CRS": <float percentage between 0 and 1, e.g., 0.85>,
  "RAS": <float percentage between 0 and 1, e.g., 0.66>,
  "explanation": "Briefly explain how you estimated these given missing fields."
}}

Customer data:
{fields}
"""
    text = user_input(question)
    try:
        blob = re.search(r"\{.*\}", text, re.DOTALL).group(0)
        return json.loads(blob)
    except Exception:
        return {"CRS": None, "RAS": None, "explanation": text}




def rag_crs_predict_scores(input_data: dict) -> dict:
    fields = "\n".join(f"- {k}: {v!r}" for k, v in input_data.items())
    question = f"""
Given the following customer data, please estimate Customer Relation Strength (CRS) and Risk Assessment Score (RAS) as float percentages.
Return exactly this JSON:
{{
  "CRS": <float percentage between 0 and 1, e.g., 0.85>,
  "explanation": "Briefly explain how you estimated these given missing fields."
}}

Customer data:
{fields}
"""
    text = user_input(question)
    try:
        blob = re.search(r"\{.*\}", text, re.DOTALL).group(0)
        return json.loads(blob)
    except Exception:
        return {"CRS": None,  "explanation": text}
