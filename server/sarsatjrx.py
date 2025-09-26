from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import random

app = FastAPI()

# Autoriser Flutter Web (exemple : localhost:5173)
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # liste des origines autorisées
    allow_credentials=False,
    allow_methods=["*"],     # GET, POST, etc.
    allow_headers=["*"],     # autorise tous les headers
)


# Stocke les trames reçues
frames = []
countdown = 10


def generate_frame():
    """Generate a fake beacon frame (key/value format)."""
    hex_id = hex(random.randint(0x100000, 0xFFFFFF))[2:].upper()
    lat = round(random.uniform(-90, 90), 6)
    lon = round(random.uniform(-180, 180), 6)
    info = random.choice(["TEST", "ALERT", "DISTRESS"])
    return {
        "Hex ID": hex_id,
        "Lat": str(lat),
        "Lon": str(lon),
        "Info": info,
        "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }


@app.get("/frame", response_class=PlainTextResponse)
async def get_frame():
    """Return the latest frame in key:value format."""
    if not frames:
        return "No frame yet"
    frame = frames[-1]
    return "\n".join(f"{k}: {v}" for k, v in frame.items())


@app.get("/sse")
async def sse():
    """Send SSE events for new frames and countdown ticks."""
    async def event_generator():
        global countdown
        while True:
            await asyncio.sleep(1)
            countdown -= 1
            if countdown <= 0:
                frame = generate_frame()
                frames.append(frame)
                countdown = 10
                yield f"data: frame\n\n"
            else:
                yield f"data: tick;{countdown};12:00:00\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
