from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def ask_pdf(document: str, question: str):

    prompt = f"""
You are an AI study assistant.

Answer ONLY from the uploaded document.

If the answer is not present,
reply:

I couldn't find that in the uploaded document.

DOCUMENT:
{document}

QUESTION:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return response.text