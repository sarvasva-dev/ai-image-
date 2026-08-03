# save_image.py
# Save generated image

import os
from uuid import uuid4
from PIL import Image
from ..config import IMAGE_FOLDER


def save_image(pil_image):
    # Resolve the absolute path of the backend directory dynamically
    utils_dir = os.path.dirname(os.path.abspath(__file__))  # backend/app/utils
    app_dir = os.path.dirname(utils_dir)                    # backend/app
    backend_dir = os.path.dirname(app_dir)                  # backend

    abs_image_folder = os.path.join(backend_dir, IMAGE_FOLDER)

    if not os.path.exists(abs_image_folder):
        os.makedirs(abs_image_folder)

    name = f"{uuid4()}.png"
    abs_path = os.path.join(abs_image_folder, name)

    pil_image.save(abs_path)

    # Return standard forward-slash relative path "images/uuid.png"
    return f"{IMAGE_FOLDER}/{name}"