# schemas.py
# Request / Response format

from pydantic import BaseModel


class GenerateRequest(BaseModel):

    prompt: str

    negative_prompt: str = ""

    steps: int = 20

    cfg: float = 7.5

    width: int = 512

    height: int = 512


class ImageResponse(BaseModel):
    id: int
    prompt: str
    negative_prompt: str = ""
    path: str
    image_url: str

    model_config = {"from_attributes": True}


