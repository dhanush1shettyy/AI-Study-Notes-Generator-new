import os

from dotenv import load_dotenv
from google import genai

from .prompts import STUDY_NOTES_PROMPT

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_notes(text: str):
    prompt = STUDY_NOTES_PROMPT.format(
        content=text
    )

    response = client.models.generate_content(
    model=os.getenv("GEMINI_MODEL"),
    contents=prompt,
)

    return response.text