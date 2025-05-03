from langchain_community.retrievers import TavilySearchAPIRetriever
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import JsonOutputParser
# from langchain_openai import ChatOpenAI
# from langchain_google_genai import ChatGoogleGenerativeAI


import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI

# Load API Key from .env file and configure the Gemini LLM.
load_dotenv()
gemini_api_key = os.getenv("GOOGLE_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    client=genai,
    temperature=0.1,
    top_k=10
)

retriever = TavilySearchAPIRetriever(k=3)

# Setup JSON Output Parser
parser = JsonOutputParser()

# Update prompt to match JSON format
financial_analysis_prompt = ChatPromptTemplate.from_template(
    """
You are a financial analyst specialized in loan and fixed deposit (FD) markets.
Analyze the current market situation based on the following 5 parameters:

1. *Benchmark Spread Trend* (G-Sec or AAA bond spread movements)
2. *Liquidity / Bid-Ask Spread* (tightness or wideness in bond/loan/FD markets)
3. *CDS Spread Movements* (5-year CDS spreads for investment-grade borrowers)
4. *Market Volatility* (referencing indices like VIX, MOVE)
5. *Recent Deal Comparables* (recent FD or loan issuances)

For each parameter:
- Provide a brief summary (1-3 lines) of the current situation.
- Assign a *score between 0 and 100*:
  - 80–100: Very favorable conditions
  - 60–79: Stable/neutral conditions
  - 40–59: Slightly unfavorable but manageable
  - 20–39: Risky conditions
  - 0–19: Very unfavorable conditions

*Important Instructions:*
- Be objective based on the context; avoid optimism bias.
- Do not add extra commentary outside of the JSON structure.
- Keep summaries concise and factual.
- Output ONLY the following JSON structure, with no additional text:

{{
  "benchmark_spread": {{
    "summary": "string",
    "score": integer (0-100)
  }},
  "liquidity": {{
    "summary": "string",
    "score": integer (0-100)
  }},
  "cds_spread": {{
    "summary": "string",
    "score": integer (0-100)
  }},
  "market_volatility": {{
    "summary": "string",
    "score": integer (0-100)
  }},
  "recent_deals": {{
    "summary": "string",
    "score": integer (0-100)
  }}
}}

Context:
{context}

Question:
Using the context above, complete the JSON structure by analyzing the current market situation.
"""
)

# Function to format retrieved docs
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Build Chain
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | financial_analysis_prompt
    | llm
    | parser
)


def get_market_trends():
    
    result = chain.invoke("Please perform current financial parameter analysis.")

    benchmark_score = result["benchmark_spread"]["score"]
    liquidity_score = result["liquidity"]["score"]
    cds_score = result["cds_spread"]["score"]
    volatility_score = result["market_volatility"]["score"]
    deals_score = result["recent_deals"]["score"]

    print(benchmark_score, liquidity_score, cds_score, volatility_score, deals_score)
    # Now multiply each with your assigned bps weight
    final_bps = (
        benchmark_score / 100 * 5.5 +
        liquidity_score / 100 * 3.5 +
        cds_score / 100 * 3.0 +
        volatility_score / 100 * 2.0 +
        deals_score / 100 * 1.0
    )
    print(f"Final Adjusted BPS: {final_bps:.2f}")
    return final_bps