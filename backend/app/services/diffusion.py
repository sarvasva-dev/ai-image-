
import random
import urllib.request
import urllib.parse
import io
import time
from PIL import Image, ImageDraw, ImageFont

pipe = None
_model_load_failed = False 


def load_model():

    global pipe, _model_load_failed
    if _model_load_failed:
        return  
    if pipe is not None:
        return  

    try:
        from diffusers import StableDiffusionPipeline
        import torch

        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float32,
        )
        pipe.to("cpu")
        print("[AI Image Studio] [SUCCESS] Local Stable Diffusion model loaded successfully")
    except Exception as e:
        _model_load_failed = True
        pipe = None
        print(f"[AI Image Studio] [WARNING] Local model unavailable: {e}")
        print("[AI Image Studio] Will use cloud generation instead (this is normal)")


def _generate_local(prompt, negative, steps, cfg, width, height):
    """Tier 1: Local Stable Diffusion pipeline."""
    if _model_load_failed or pipe is None:
        load_model()
    if pipe is None:
        raise RuntimeError("Local model not available")

    image = pipe(
        prompt=prompt,
        negative_prompt=negative,
        num_inference_steps=steps,
        guidance_scale=cfg,
        width=width,
        height=height,
    ).images[0]
    return image


def _generate_pollinations(prompt, width, height):

    encoded_prompt = urllib.parse.quote(prompt)
    seed = random.randint(1, 999999)
    url = (
        f"https://image.pollinations.ai/p/{encoded_prompt}"
        f"?width={width}&height={height}&seed={seed}&nologo=true"
    )

    max_retries = 2
    for attempt in range(max_retries):
        try:
            print(f"[AI Image Studio] [INFO] Pollinations API attempt {attempt + 1}/{max_retries}...")
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Image-Studio/2.0"
                },
            )
        
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    img_data = response.read()
                    if len(img_data) > 1000:  
                        print(f"[AI Image Studio] [SUCCESS] Pollinations returned {len(img_data)} bytes")
                        return Image.open(io.BytesIO(img_data))
                    else:
                        print(f"[AI Image Studio] [WARNING] Response too small ({len(img_data)} bytes), retrying...")
                else:
                    print(f"[AI Image Studio] [WARNING] Pollinations returned status {response.status}")
        except Exception as e:
            print(f"[AI Image Studio] [WARNING] Pollinations attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(1) 

    raise RuntimeError("Pollinations API exhausted all retries")


def _generate_procedural(prompt, width, height):
  
    image = Image.new("RGB", (width, height), color=(18, 18, 24))
    draw = ImageDraw.Draw(image)

    char_sum = sum(ord(c) for c in prompt)

   
    r1, g1, b1 = (char_sum * 7) % 80, (char_sum * 13) % 40 + 10, (char_sum * 19) % 100 + 40
    r2, g2, b2 = (char_sum * 3) % 100 + 100, (char_sum * 9) % 100 + 50, (char_sum * 23) % 100 + 150

    for y in range(height):
        ratio = y / height
        r = int(r1 * (1 - ratio) + r2 * ratio)
        g = int(g1 * (1 - ratio) + g2 * ratio)
        b = int(b1 * (1 - ratio) + b2 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    random.seed(prompt)
    for _ in range(8):
        color = (random.randint(150, 255), random.randint(100, 255), random.randint(200, 255))
        shape = random.choice(["circle", "rect", "polygon"])
        x0 = random.randint(0, width)
        y0 = random.randint(0, height)
        size = random.randint(40, min(width, height) // 2)

        if shape == "circle":
            draw.ellipse([x0 - size, y0 - size, x0 + size, y0 + size], outline=color, width=2)
        elif shape == "rect":
            draw.rectangle([x0, y0, x0 + size, y0 + size], outline=color, width=2)
        else:
            points = [(random.randint(0, width), random.randint(0, height)) for _ in range(3)]
            draw.polygon(points, outline=color)

    for x in range(0, width, 64):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255), width=1)
    for y_pos in range(0, height, 64):
        draw.line([(0, y_pos), (width, y_pos)], fill=(255, 255, 255), width=1)

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    draw.text((24, height - 80), "AETHERIA AI STUDIO", fill=(255, 255, 255), font=font)
    draw.text((24, height - 60), f'"{prompt[:40]}..."', fill=(200, 200, 255), font=font)
    draw.text((24, height - 40), "Offline Procedural Mode", fill=(150, 150, 150), font=font)

    print("[AI Image Studio] [SUCCESS] Procedural fallback image generated")
    return image


def generate_image(
    prompt,
    negative="",
    steps=20,
    cfg=7.5,
    width=512,
    height=512,
):

    try:
        return _generate_local(prompt, negative, steps, cfg, width, height)
    except Exception as e:
        print(f"[AI Image Studio] Tier 1 (Local SD) skipped: {e}")

    try:
        return _generate_pollinations(prompt, width, height)
    except Exception as e:
        print(f"[AI Image Studio] Tier 2 (Pollinations) failed: {e}")

    try:
        return _generate_procedural(prompt, width, height)
    except Exception as e:
        print(f"[AI Image Studio] Tier 3 (Procedural) failed unexpectedly: {e}")

    print("[AI Image Studio] [WARNING] All tiers failed, returning blank canvas")
    return Image.new("RGB", (width, height), color=(40, 40, 80))