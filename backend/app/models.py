# models.py
# Database table

from sqlalchemy import Column, Integer, String
from .database import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)

    prompt = Column(String)

    negative_prompt = Column(String)

    path = Column(String)