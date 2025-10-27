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
battery = 100


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

@app.get("/frames", response_class=PlainTextResponse)
async def get_all_frames():
    """Return all frames separated by '#\\n'."""
    if not frames:
        return ""
    return "\n#\n".join(
        "\n".join(f"{k}={v}" for k, v in frame.items())
        for frame in frames)

config_text = """data: config
data: wifiSsid=ssid
data: wifiPassPhrase=passphrase
data: wifiSsid1=ssid1
data: wifiPassPhrase1=passphrase1
data: wifiSsid2=ssid2
data: wifiPassPhrase2=passphrase2
data: timeZone=TimZoneParis
data: displayReverse=false
data: showBatPercentage=true
data: showBatWarnMessage=true
data: screenOffOnCharge=true
data: buzzerLevel=95
data: touchSound=true
data: frameSound=true
data: countdownSound=true
data: countdownLeds=true
data: reloadCountdown=false
data: countdownDuration=50
data: allowFrameSimu=false
data: fliterOrbito=true
data: filterInvalid=false
data: wifiMode=STA
data: wifiStatus=Connected to access point
data: wifiRssi=-57dBm
data: wifiSsid=connectedssid
data: wifiIP=192.168.0.90
data: wifiGatewayIP=192.168.0.1
data: wifiDNS1=192.168.0.1
data: wifiDNS2=192.168.0.2
data: wifiMacAddress=AA:BB:CC:DD:EE:FF
data: wifiSubnetMask=255.255.255.0
data: rtcDate=10/10/2025 - 10:15:12
data: rtcNtpSync=true
data: sdCardMounted=true
data: sdCardTotalBytes=26548015
data: sdCardUsedBytes=152000
data: firmwareVersion=1.0.1
data: sketchInfo=1414 kn (MD5=fdsfdsf...sdffds)
data: chipModel=ESP32-D0W-V3
data: chipCores=2
data: chipFrequency=240 MHz
data: ramSize=234
data: ramFree=51
data: psRamSize=4096
data: psRamFree=4057
data: flashSize=16384
data: flashFreq=40 MHz
data: powerVcc=3.89
data: powerState=On Battery
data: powerBatteryPercentage=75
data: upTime=02'53"

"""

@app.post("/config", response_class=PlainTextResponse)
async def config():
    return ""


@app.get("/sse")
async def sse():
    """Send SSE events for new frames and countdown ticks."""
    async def event_generator():
        global countdown
        global battery
        # Send  config
        yield config_text
        while True:
            await asyncio.sleep(1)
            battery-= 5
            if battery < 0:
                battery = 100
            countdown -= 1
            if countdown <= 0:
                valid = random.choice([1,1,1,1,1,0])
                if valid:
                    filtered = random.choice(["1","1","1","1","0"])
                    error = random.choice(["1","1","1","0","0"])
                    frame = generate_frame()
                    frames.append(frame)
                    countdown = 10
                    frameString = "\n".join(f"data: {k}={v}" for k, v in frame.items())
                    yield f"data: frame;1;{filtered};{error}\n{frameString}\n\n"
                else:
                    yield f"data: frame;0;1;1\n\n"
            else:
                yield f"data: tick;{countdown};1;1;{battery};12:00:00\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
