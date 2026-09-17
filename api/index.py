import sys
from pathlib import Path

# Make the repository root importable inside the Vercel Python runtime.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.server import app  # noqa: E402,F401

# Vercel discovers the FastAPI ASGI application from `app`.
