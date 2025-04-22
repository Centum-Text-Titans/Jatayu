import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI

# Load API Key from .env file and configure the Gemini LLM.
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    client=genai,
    temperature=0.1,
    top_k=10
)

def user_input(question: str) -> str:
    """
    Send the question directly to the Gemini LLM and return the response.
    """
    # Directly query the LLM without using FAISS.
    # Assuming the llm instance can be called with the question string.
    response = llm(question)
    
    # Depending on the LLM's response structure, adjust how the text is extracted.
    # For example, if the response is a dict with a "message" field:
    if isinstance(response, dict) and "message" in response:
        return response["message"]["content"].strip()
    # Otherwise, if the response is a plain string:
    return str(response).strip()


def get_house_loan_trend() -> float:
    """
    Retrieves the current market trend for house loans via the Gemini LLM.
    The question asks for a comparison of historical trends and returns only the 
    current normalized trend value (0 to 1).
    
    Returns:
        float: Normalized trend value for house loans (e.g., 0.40). Returns None if conversion fails.
    """
    question = (
        "Review the trends over the past several years for house loans. Considering the historical data, "
        "what is the current market trend for house loans as a normalized value between 0 and 1? "
        "Please return only a numeric value (for example, 0.40)."
    )
    response_text = user_input(question)
    try:
        trend = float(response_text)
    except Exception as e:
        print("Error converting house loan trend response to float:", e)
        trend = None
    return trend


def get_fixed_deposit_trend() -> float:
    """
    Retrieves the current market trend for fixed deposits via the Gemini LLM.
    The question asks for a comparison of historical trends and returns only the 
    current normalized trend value (0 to 1).
    
    Returns:
        float: Normalized trend value for fixed deposits (for example, 0.67). Returns None if conversion fails.
    """
    question = (
        "Review the trends over the past several years for fixed deposits. Considering the historical data, "
        "what is the current market trend for fixed deposits as a normalized value between 0 and 1? "
        "Please return only a numeric value (for example, 0.67)."
    )
    response_text = user_input(question)
    try:
        trend = float(response_text)
    except Exception as e:
        print("Error converting fixed deposit trend response to float:", e)
        trend = None
    return trend
