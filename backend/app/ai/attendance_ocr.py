import os
import cv2
import pytesseract

# Was hardcoded to a Windows-only path (C:\Program Files\Tesseract-OCR\...),
# which meant this silently threw on any non-Windows host (Linux/macOS
# servers, containers, etc.) — pytesseract already finds a `tesseract` on
# PATH by default, so only override it if TESSERACT_CMD is explicitly set.
_tesseract_cmd = os.environ.get("TESSERACT_CMD")
if _tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = _tesseract_cmd

def preprocess_image(image_path: str):
    img = cv2.imread(image_path)
    if img is None:
        # cv2.imread() returns None instead of raising on an unreadable file
        # (corrupt upload, unsupported format, empty file) — turn that into
        # a real exception with a message that actually explains what went
        # wrong, instead of the caller crashing a few lines later on
        # cv2.cvtColor(None, ...) with a cryptic OpenCV assertion error.
        raise ValueError(f"Could not read image at {image_path} — the file may be corrupt or in an unsupported format.")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Upscale small photos before thresholding — Tesseract's accuracy drops
    # sharply on small text, and a phone photo of a printed/handwritten roll
    # sheet downscaled by the browser before upload is a common case here.
    h, w = gray.shape[:2]
    if max(h, w) < 1600:
        scale = 1600 / max(h, w)
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    return thresh

def extract_text(image_path: str):
    processed = preprocess_image(image_path)
    data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)
    extracted_lines = []
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        conf = data['conf'][i]
        if text and conf != '-1':
            extracted_lines.append({"text": text, "confidence": float(conf) / 100})
    return extracted_lines
import re

def parse_attendance(ocr_results, known_ids=None):
    """
    Takes raw OCR results and tries to extract (roll_number, status) pairs.
    Assumes a pattern where a roll number is followed shortly by a status mark.

    `known_ids`: the real id_label values of this teacher's roster (e.g.
    "CS21B045"), if available. Roll numbers in this app are alphanumeric,
    not bare digits — matching OCR tokens against the actual roster instead
    of guessing a fixed digit-only shape is what makes this work at all for
    real ID formats (a pure `\\d{1,4}` pattern would never match "CS21B045"
    no matter how good the OCR read was). Falls back to the old digit-only
    heuristic if no roster is supplied, for standalone/generic use.
    """
    parsed = []
    pending_roll = None
    known_upper = {re.sub(r"[^A-Za-z0-9]", "", k).upper() for k in known_ids} if known_ids else None

    for item in ocr_results:
        text = item["text"].strip()
        confidence = item["confidence"]

        # Looks like a roll number: matches a known student ID from this
        # roster (preferred), or falls back to a bare 1-4 digit number if no
        # roster was supplied.
        cleaned = re.sub(r"[^A-Za-z0-9]", "", text).upper()
        is_roll = (cleaned in known_upper) if known_upper is not None else bool(re.fullmatch(r"\d{1,4}", text))
        if is_roll and cleaned:
            pending_roll = {"roll_number": cleaned, "confidence": confidence}
            continue

        # Looks like a status mark: P, A, Present, Absent, Pp, p, etc.
        normalized = text.upper().replace("PP", "P")
        if normalized in ("P", "PRESENT"):
            normalized = "P"
        elif normalized in ("A", "ABSENT"):
            normalized = "A"
        if normalized in ("P", "A") and pending_roll:
            status = "PRESENT" if normalized == "P" else "ABSENT"
            avg_conf = (pending_roll["confidence"] + confidence) / 2
            parsed.append({
                "roll_number": pending_roll["roll_number"],
                "status": status,
                "confidence": round(avg_conf, 2)
            })
            pending_roll = None

    return parsed