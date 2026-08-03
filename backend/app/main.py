# main.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import Base, engine
from .api.routes import router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# include routes
app.include_router(router)

# absolute path to images folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
images_path = os.path.join(BASE_DIR, "images")
os.makedirs(images_path, exist_ok=True)

# serve images
app.mount("/images", StaticFiles(directory=images_path), name="images")