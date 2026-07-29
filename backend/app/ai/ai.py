from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_pdf(document: str, question: str):
    prompt = f"""
You are an expert AI Study Assistant.

Use ONLY the uploaded document to answer.

Instructions:
- If the answer exists in the document, explain it clearly and naturally.
- You may summarize and simplify the information.
- Do NOT make up information.
- If the answer truly does not exist in the document, reply exactly:
I couldn't find that information in the uploaded document.

DOCUMENT:
{document}

QUESTION:
{question}

ANSWER:
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return response.text


def generate_notes(document: str):
    prompt = f"""
You are an expert AI Study Assistant.

Read the following document and generate clean, well-structured study notes from it.

Instructions:
- Organize the notes with clear headings and bullet points.
- Highlight key concepts, definitions, and important facts.
- Keep the language simple and easy to study from.
- Do NOT add information that isn't in the document.
- Use Markdown formatting (##, **, -, etc).

DOCUMENT:
{document}

STUDY NOTES:
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return response.text