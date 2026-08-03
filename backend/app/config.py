# config.py
# Stores environment variables

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./images.db"
)

IMAGE_FOLDER = os.getenv(
    "IMAGE_FOLDER",
    "images"
)