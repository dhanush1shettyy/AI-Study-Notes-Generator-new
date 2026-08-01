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


def generate_flashcards(document: str, count: int = 10):
    prompt = f"""
You are an expert AI Study Assistant.

Read the following document and create exactly {count} flashcards to help a
student review the material.

Instructions:
- Each flashcard has a "question" and an "answer".
- Questions should test understanding of key concepts, definitions, and facts.
- Answers should be short and precise — a few sentences at most.
- Do NOT add information that isn't in the document.
- Respond with ONLY a valid JSON array, no markdown code fences, no extra text.

Format exactly like this:
[
  {{"question": "...", "answer": "..."}},
  {{"question": "...", "answer": "..."}}
]

DOCUMENT:
{document}

JSON:
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return response.text


NOTE_STYLE_INSTRUCTIONS = {
    "concise": """
- Keep it short. Use tight bullet points only, no long paragraphs.
- Only include the most important facts, definitions, and concepts.
- Aim for something that can be reviewed in under 5 minutes.
""",
    "detailed": """
- Organize the notes with clear headings and bullet points.
- Highlight key concepts, definitions, and important facts.
- Include explanations, not just fragments, so someone who missed the
  material entirely could still learn it from these notes alone.
""",
    "exam": """
- Structure the notes around what's likely to be tested.
- For each major concept, include a short "Likely exam angle" note
  (e.g. what a question about this might ask).
- End with a "Key terms to remember" section listing important
  definitions in a compact list.
""",
}


def generate_notes(document: str, style: str = "detailed"):
    style_instructions = NOTE_STYLE_INSTRUCTIONS.get(
        style, NOTE_STYLE_INSTRUCTIONS["detailed"]
    )

    prompt = f"""
You are an expert AI Study Assistant.

Read the following document and generate clean, well-structured study notes from it.

Instructions:
{style_instructions}
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