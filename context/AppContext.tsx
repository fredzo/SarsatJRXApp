import { FrameContext } from "@/providers/FrameProvider";
import { AudioModule, useAudioPlayer } from 'expo-audio';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import EventSource, { MessageEvent } from 'react-native-sse';

//const DEVICE_URL = 'http://sarsatjrx.local';
//const DEVICE_URL = 'http://localhost';
const DEVICE_URL = 'http://192.168.0.83';
//const DEVICE_URL = 'http://10.0.2.2';
//const DEVICE_URL = 'http://10.157.161.213';

type AppContextType = {
  time: string | null;
  sdMounted: boolean;
  discriOn: boolean;
  batteryPercentage: number | null;
  connected: boolean;
};

export const AppContext = createContext<AppContextType>({
  time: null,
  sdMounted: false,
  discriOn: false,
  batteryPercentage: null,
  connected:false,
});

let globalEventSource:EventSource | null = null;

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    // Header info
    const [time, setTime] = useState<string | null>(null);
    const [sdMounted, setSdMounted] = useState<boolean>(false);
    const [discriOn, setDiscriOn] = useState<boolean>(false);
    const [batteryPercentage, setBatteryPercentage] = useState<number | null>(null);
    // Connection management
    const { frames, addFrame, setCountdown } = useContext(FrameContext);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryDelay = useRef(1000); // 1s au départ
    const maxDelay = 5000; // 5s max
    const hasRun = useRef(false);
    const inBackground = useRef(false); // True when app is in background
    // Keep track on the latest frames status
    const framesRef = useRef(frames);
    // Connection status
    const [connected, setConnected] = useState(false);
    const lastMessageRef = useRef<number>(Date.now());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const soundOK = useAudioPlayer(require('../assets/ok.mp3'));
    const soundKO = useAudioPlayer(require('../assets/ko.mp3'));
    const soundError = useAudioPlayer(require('../assets/invalid.mp3'));
    const soundFiltered = useAudioPlayer(require('../assets/filtered.mp3'));
    const beepHigh = useAudioPlayer(require('../assets/counth.mp3'));
    const beepLow = useAudioPlayer(require('../assets/countl.mp3'));

    function playSoundOK() {
        soundOK.seekTo(0);
        soundOK.play();
        setTimeout(() => {
            soundOK.pause();
        }, 250); // Pause sound at the end to stop ducking other audio sources

    }

    function playSoundKO() {
        soundKO.seekTo(0);
        soundKO.play();
        setTimeout(() => {
            soundKO.pause();
        }, 250); // Pause sound at the end to stop ducking other audio sources
    }

    function playSoundError() {
        soundError.seekTo(0);
        soundError.play();
        setTimeout(() => {
            soundError.pause();
        }, 350); // Pause sound at the end to stop ducking other audio sources
    }

    function playSoundFiltered() {
        soundFiltered.seekTo(0);
        soundFiltered.play();
        setTimeout(() => {
            soundFiltered.pause();
        }, 350); // Pause sound at the end to stop ducking other audio sources
    }

    function playBeepHigh() {
        beepHigh.seekTo(0);
        beepHigh.play();
        setTimeout(() => {
            beepHigh.pause();
        }, 300); // Pause sound at the end to stop ducking other audio sources
    }

    function playBeepLow() {
        beepLow.seekTo(0);
        beepLow.play();
        setTimeout(() => {
            beepLow.pause();
        }, 300); // Pause sound at the end to stop ducking other audio sources
    }

    async function fetchFrames() {
        try {
            const resp = await fetch(DEVICE_URL+'/frames');
            const text = await resp.text();
            text.split("\n#\n").forEach(line => 
            {
                parseFrame(line);
            });
        } catch {}
    }

    async function fetchFrame() {
        try {
            const resp = await fetch(DEVICE_URL+'/frame');
            const text = await resp.text();
            parseFrame(text);
        } catch {}
    }

    function parseFrame(frameData: string) {
        try {
            const parsed: Record<string, string> = {};
            frameData.split(/\r?\n/).forEach(line => {
                const idx = line.indexOf('=');
                const key = line.slice(0, idx);
                const value = line.slice(idx + 1);
                //console.log("Frame data:",key,value);
                if (key && value) parsed[key.trim()] = value.trim();
            });
            if(Object.entries(parsed).length > 0)
            {
                addFrame(parsed);
            }
        } catch {}
    }
    
    const handleMessage = (e: MessageEvent) => {
        if (!e.data) return;
        if (e.data.startsWith('tick;')) 
        {
            const parts = e.data.split(';');
            if(parts.length==6)
            {
                const val = parseInt(parts[1]);
                if(val > 1 && val <= 5)
                {
                    playBeepLow();
                }
                else if(val == 1)
                {
                    playBeepHigh();
                }
                setCountdown(val);
                setTime(parts[5]);
                setSdMounted(parts[2] === "1");
                setDiscriOn(parts[3] === "1");
                setBatteryPercentage(parseInt(parts[4]));
            }
        } 
        else if (e.data.startsWith('frame'))
        {
            const parts = e.data.split(';');
            if(parts.length==4)
            {
                const valid = parts[1] === "1";
                const filtered = parts[2] === "1";
                const error = parts[3] === "1";
                //console.log("Event data: ",e.data);
                if(valid && !filtered)
                {
                    parseFrame(e.data.split("\n").slice(1).join("\n"));
                    if(error)
                    {
                        playSoundKO();
                    }
                    else
                    {
                        playSoundOK();
                    }
                }
                else
                {
                    if(valid)
                    {
                        if(error)
                        {
                            playSoundKO()
                        }
                        else
                        {
                            playSoundFiltered();
                        }
                    }
                    else
                    {
                        playSoundError();
                    }
                }
            }
        }
    };

    const clearReconnectTimer = () => {
        if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
        }
    };

    const scheduleReconnect = () => {
            if (reconnectTimeout.current) return; // Reconnection already pending
            console.log(`🔁 Reconnection attempt in ${retryDelay.current / 1000}s...`);
            reconnectTimeout.current = setTimeout(() => {
            connect();
            reconnectTimeout.current = null;
        }, retryDelay.current);

        // Exponential reconnection delay
        retryDelay.current = Math.min(retryDelay.current * 2, maxDelay);
    };

    const clearGlobalEventSource = () => {
        clearReconnectTimer();
        if((globalEventSource))
        {
            globalEventSource.removeAllEventListeners();
            globalEventSource.close();
            globalEventSource = null;
        }

    };


    const connect = () => {
        clearGlobalEventSource();
        console.log("🔌 EventSource connection...");
        globalEventSource = new EventSource(DEVICE_URL+"/sse");

        globalEventSource.addEventListener("open", () => {
            console.log("✅ EventSource connected");
            retryDelay.current = 1000; // reset reconnection delay
            if(framesRef.current.length == 0) // Make sure we have latest frames length value
            {   // No frames yet, check for frames on the decoder
                fetchFrames();
            }
        });

        globalEventSource.addEventListener("message", (event) => {
            console.log("📩 SSE received :", event.data);
            lastMessageRef.current = Date.now();
            if (!connected) setConnected(true);
            handleMessage(event);
        });

        globalEventSource.addEventListener("error", (event) => {
            console.log("⚠️ SSE error, will retry…");
            globalEventSource?.close();
            setConnected(false);
            scheduleReconnect();
        });

        globalEventSource.addEventListener("close", (event) => {
            console.log("⚠️ SSE close, will retry…");
            globalEventSource?.close();
            setConnected(false);
            scheduleReconnect();
        });

        return globalEventSource;
    };

    useEffect(() => {
        framesRef.current = frames;
        if (hasRun.current) return;
        hasRun.current = true;
        // Fetch frames is done on SSE connection
        //fetchFrames();

        AudioModule.setAudioModeAsync({
            shouldPlayInBackground: true,
            interruptionMode: 'duckOthers',
            interruptionModeAndroid: 'duckOthers',
            playsInSilentMode: true,
            shouldRouteThroughEarpiece: false,
        });

        connect();

        // Check periodically if messages are still coming
        timeoutRef.current = setInterval(() => {
            const delta = Date.now() - lastMessageRef.current;
            if (delta > 3000) {
                setConnected(false);
                scheduleReconnect();
            }
        }, 1000);


        const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
            inBackground.current = false;
            // Reconnect now
            clearReconnectTimer();
            connect();
        } else if (state === "background") {
            inBackground.current = true;
        }
        });

        return () => {
            // Keep resources since app context can be reloaded on frame provider changes
            /*console.log("👋 Closing EventSource");
            globalEventSource.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            if (timeoutRef.current) clearInterval(timeoutRef.current);*/
        };
    }, [fetchFrames]);

  return (
    <AppContext.Provider value={{ time, sdMounted, discriOn, batteryPercentage, connected }}>
      {children}
    </AppContext.Provider>
  );
};