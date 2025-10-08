import { initAudio, playBeepHigh, playBeepLow, playSoundError, playSoundFiltered, playSoundKO, playSoundOK } from "@/lib/audio";
import { addFrame, currentFrame, currentIndex, Frame, frames, nextFrame, prevFrame } from '@/lib/frames';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import EventSource, { MessageEvent } from 'react-native-sse';

type AppContextType = {
    // App
    time: string | null;
    sdMounted: boolean;
    discriOn: boolean;
    batteryPercentage: number | null;
    connected: boolean;
    deviceURL: string | null,
    setDeviceURL: (url: string) => void;
    // Frames
    frames: Frame[];
    currentFrame: Frame | null;
    currentIndex: number;
    countdown: number | null;
    addFrame: (data: Record<string, string>) => void;
    setCountdown: (countdown: number) => void;
    nextFrame: () => void;
    prevFrame: () => void;
};

export const AppContext = createContext<AppContextType>({
    // App
    time: null,
    sdMounted: false,
    discriOn: false,
    batteryPercentage: null,
    connected:false,
    deviceURL: null,
    setDeviceURL: () => {},
    // Frames
    frames: [],
    currentFrame: null,
    currentIndex: 0,
    countdown: null,
    addFrame: () => {},
    setCountdown: () => {},
    nextFrame: () => {},
    prevFrame: () => {},
});

let globalEventSource:EventSource | null = null;

let deviceURL: string | null = null;

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    // Header info
    const [time, setTime] = useState<string | null>(null);
    const [sdMounted, setSdMounted] = useState<boolean>(false);
    const [discriOn, setDiscriOn] = useState<boolean>(false);
    const [batteryPercentage, setBatteryPercentage] = useState<number | null>(null);
    // Connection management
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
    // Countdown
    const [countdown, setCountdownValue] = useState<number | null>(null);

    const setCountdown = (countdown: number) => {
        setCountdownValue(i => (countdown));
    };

    async function fetchFrames() {
        if(!deviceURL) return;
        try {
            const resp = await fetch(deviceURL+'/frames');
            const text = await resp.text();
            text.split("\n#\n").forEach(line => 
            {
                parseFrame(line);
            });
        } catch {}
    }

    async function fetchFrame() {
        if(!deviceURL) return;
        try {
            const resp = await fetch(deviceURL+'/frame');
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
            if (reconnectTimeout.current) return;
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
        if(!deviceURL) return;
        clearGlobalEventSource();
        const url = deviceURL + "/sse";
        console.log("🔌 Connecting SSE to", url);
        globalEventSource = new EventSource(url);

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

    // 💾 Persist new device URL whenever it changes
    const setDeviceURL = async (url: string) => {
        deviceURL = url;
        await AsyncStorage.setItem("lastDeviceURL", url);
    };    

    useEffect(() => {
        framesRef.current = frames;
        // Only run init stuff once
        if (hasRun.current) return;
        hasRun.current = true;

        // Load previously saved device URL
        (async () => {
        try {
            const saved = await AsyncStorage.getItem("lastDeviceURL");
            if(saved)
            {   // Reload previous value
                deviceURL = saved;
            }
            else
            {   // Init to default
                setDeviceURL("http://sarsatjrx.local");
            }
        } catch (e) {
            console.warn("Error loading device URL", e);
        }
        })();

        initAudio();

        // Check periodically if messages are still coming
        timeoutRef.current = setInterval(() => {
            const delta = Date.now() - lastMessageRef.current;
            if (delta > 3000) {
                console.log("⚠️ Connection lost, reconnecting…");
                setConnected(false);
                // Clear delay
                lastMessageRef.current = Date.now();
                // Reconnect now
                clearReconnectTimer();
                connect();
            }
        }, 1000);


        const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
            inBackground.current = false;
            console.log("⚠️ App is active again !");
            if(!connected)
            {   // Reconnect now
                clearReconnectTimer();
                connect();
            }
        } else if (state === "background") {
            console.log("⚠️ App in background…");
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
    }, []);

    // Reconnect on deviceURL change
    useEffect(() => {
        clearReconnectTimer();
        connect();
    }, [deviceURL]);

  return (
    <AppContext.Provider value={{ time, sdMounted, discriOn, batteryPercentage, connected, deviceURL, setDeviceURL, frames, currentFrame, currentIndex, countdown, addFrame, setCountdown, nextFrame, prevFrame }}>
      {children}
    </AppContext.Provider>
  );
};