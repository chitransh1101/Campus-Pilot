# CampusPilot backend — FastAPI + SQLAlchemy, served by uvicorn.
#
# Tesseract-OCR (the real attendance-photo OCR engine, not just its Python
# wrapper) is installed system-wide right here — that's the whole point of
# containerizing this: whoever runs this image gets real OCR working
# out of the box, with no separate install on their own machine (see
# campuspilot_backend/README.md's "Real attendance OCR setup" for what that
# manual install looks like on a bare host — this Dockerfile does it once,
# for everyone who runs the image).
FROM python:3.12-slim

# tesseract-ocr        — the actual OCR engine (pytesseract is just a wrapper)
# libgl1, libglib2.0-0  — required by opencv-python-headless at import time
#                         even though it's the "headless" build (it still
#                         links against these at runtime on Debian slim)
RUN apt-get update && apt-get install -y --no-install-recommends \
      tesseract-ocr \
      libgl1 \
      libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# SQLite lives on a mounted volume (see docker-compose.yml) so your data
# survives a rebuild/redeploy instead of resetting every time the image
# changes.
RUN mkdir -p /app/data
ENV DATABASE_URL=sqlite:////app/data/campuspilot.db

RUN chmod +x entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
