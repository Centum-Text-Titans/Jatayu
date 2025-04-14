import os
import re
import json
import PyPDF2
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI


# Load API Key from .env file and configure the Gemini LLM.
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
llm = ChatGoogleGenerativeAI( model="gemini-2.0-flash",  client=genai,  temperature=0.1,   top_k=10  )




def map_columns_with_llm(uploaded_cols, local_cols):
    """
    Uses the LLM to map uploaded columns to local database columns.
    This function sends a prompt to the LLM with a list of uploaded and local column names.
    """
    # Construct the prompt with context and instructions
    prompt = f"""
    I have the following list of column names from an uploaded customer data file:
    {uploaded_cols}
    
    I want to map them to my local database schema with the following column names:
    {local_cols}
    
    Some column names may be semantically similar but named differently. Provide a JSON mapping where each key is a column from the uploaded file, and the value is the corresponding local column name.
    If a column does not have a clear mapping, map it to null.
    """

    # Send the prompt to the LLM and retrieve the response (pseudo-code)
    try:
        # Note: The actual LLM call will depend on the library's interface.
        result = llm.invoke(prompt)
        # Assuming result has a field 'text' with the JSON mapping
        mapping = json.loads(result.text)
    except Exception as e:
        print("Error in LLM mapping:", e)
        # Fallback: Use identity mapping for columns that already exist in local schema
        mapping = {col: col if col in local_cols else None for col in uploaded_cols}
    
    # Optional: clean mapping (e.g., remove None values or prompt user for manual review)
    mapping = {k: v for k, v in mapping.items() if v is not None}
    print("Column mapping:", mapping)
    return mapping


def extract_text_from_pdf(pdf_file):
    """
    Extracts text from the given PDF file using PyPDF2.
    """
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text


def extract_customer_data_from_pdf(pdf_text, local_columns):
    """
    Uses the LLM to extract customer data from the PDF text.
    The prompt instructs the LLM to parse the text and extract values corresponding to
    the provided local database columns.
    """
    # Craft the prompt with the PDF text and expected columns.
#     prompt = f"""
# I have extracted the following text from a PDF that contains a single customer's details:
# {pdf_text}

# Please extract the customer information for the following fields if available:
# {local_columns}

# if there is a column named balance in the extracted text then divide it into half and assign it to checking account balance and savings account balance respectively.

# Return the output as a JSON object mapping each field to its extracted value. If a field is not available, return it as null.
# """
    prompt = f"""
    I have extracted the following text from a PDF that contains a single customer's details:
    {pdf_text}

    Please extract the customer information for the following fields if available:
    {local_columns}

    Additional instructions:
    1. If a column named 'Balance' is extracted from the text, divide its value in half and assign the results to two new fields: 'checking account balance' and 'savings account balance'.
    2. For any numeric values that are extracted, ensure they are returned as numbers (int or float) rather than strings. For example, if the value is 250000, it should appear as 250000 (or 250000.0 if applicable), not "250000".
    3. Return the output as a JSON object mapping each field to its extracted value. If a field is not available, return it as null.
    Please follow these instructions closely.
    """
    try:
        result = llm.invoke(prompt)
        print(result)
        pattern = r"```json\s*(\{.*?\})\s*```"
        match = re.search(pattern, result.content, re.DOTALL)

        if match:
            json_str = match.group(1)
            try:
                customer_data = json.loads(json_str)
                print("Extracted customer data:")
                print(customer_data)
            except json.JSONDecodeError as e:
                print("Error decoding JSON:", e)
        else:
            print("No JSON content found in the string.")
    except Exception as e:
        print("Error extracting customer data via LLM:", e)
        customer_data = None
    
    return customer_data


