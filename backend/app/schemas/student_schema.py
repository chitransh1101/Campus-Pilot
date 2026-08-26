from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class GrievanceCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    category: str
    description: str
    # Optional contact address, format-checked server-side in the router
    # (require_role guards WHO can call this; this checks WHAT they sent).
    contact_email: Optional[str] = Field(default=None, alias="contactEmail")


class BookRequestCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    book_id: str = Field(alias="bookId")
