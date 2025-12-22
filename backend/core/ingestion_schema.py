from pydantic import BaseModel
from typing import List

class IngestionResult(BaseModel):
    core_concepts: List[str]
    definitions: List[str]
    examples: List[str]
    diagram_descriptions: List[str]
    clean_markdown: str
