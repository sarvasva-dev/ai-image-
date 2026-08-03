# routes.py

import os
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from .. import models, schemas
from ..services.diffusion import generate_image
from ..utils.save_image import save_image

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _make_image_url(db_path: str) -> str:
    """Extract the UUID filename from a database path and build a clean URL.
    Handles both Windows backslash paths and forward-slash paths."""
    if not db_path:
        return ""
    filename = os.path.basename(db_path.replace("\\", "/"))
    return f"/images/{filename}" if filename else ""


def _clean_path(db_path: str) -> str:
    """Normalize backslashes to forward slashes."""
    return db_path.replace("\\", "/") if db_path else ""


@router.post("/generate", response_model=schemas.ImageResponse)
def generate(
    data: schemas.GenerateRequest,
    db: Session = Depends(get_db),
):
    try:
        img = generate_image(
            data.prompt,
            data.negative_prompt,
            data.steps,
            data.cfg,
            data.width,
            data.height,
        )

        path = save_image(img)

        db_img = models.Image(
            prompt=data.prompt,
            negative_prompt=data.negative_prompt,
            path=path,
        )

        db.add(db_img)
        db.commit()
        db.refresh(db_img)

        return {
            "id": db_img.id,
            "prompt": db_img.prompt,
            "negative_prompt": db_img.negative_prompt or "",
            "path": _clean_path(path),
            "image_url": _make_image_url(path),
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/history", response_model=list[schemas.ImageResponse])
def history(db: Session = Depends(get_db)):
    db_images = db.query(models.Image).all()

    return [
        {
            "id": img.id,
            "prompt": img.prompt,
            "negative_prompt": img.negative_prompt or "",
            "path": _clean_path(img.path),
            "image_url": _make_image_url(img.path),
        }
        for img in db_images
    ]