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
    title = random.choice(["Self-test 406", "Distress 406", "Orbitography 406"])
    protocol = random.choice(["Standard Protocol", "User Test Protocol", "Orbitography Protocol"])
    protocolDesc = random.choice(["Standard Protocol description", "User Test Protocol description", "Orbitography Protocol description"])
    country = random.choice(["FRA(227) - France", "ES(223) - Spain", "US(02) - United States"])
    bch1 = random.choice(["ok", "ko"])
    bch2 = random.choice(["ok", "ko"])
    country = random.choice(["FRA(227) - France", "ES(223) - Spain", "US(02) - United States"])
    hex_id = hex(random.randint(0x100000, 0xFFFFFF))[2:].upper()
    lat = round(random.uniform(-90, 90), 6)
    lon = round(random.uniform(-180, 180), 6)
    return {
        "date": time.strftime("%d/%m/%Y"),
        "time": time.strftime("%H:%M:%S"),
        "title": title,
        "protocol": protocol,
        "protocolDesc": protocolDesc,
        "country": country,
        "lat": str(lat),
        "lon": str(lon),
        "bch1": bch1,
        "bch2": bch2,
        "hexId": hex_id,
        "mainDevice" : "Internal",
        "axDevice" : "121.5 MHz",
        "data": "8E3E0425A8318074FE44B735CD7B46",
    }


@app.get("/frame", response_class=PlainTextResponse)
async def get_frame():
    """Return the latest frame in key:value format."""
    if not frames:
        return "No frame yet"
    frame = frames[-1]
    return "\n".join(f"{k}={v}" for k, v in frame.items())


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
                frameString = "\n".join(f"data: {k}={v}" for k, v in frame.items())
                yield f"data: frame;true,true\n{frameString}\n\n"
            else:
                yield f"data: tick;{countdown};12:00:00\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
