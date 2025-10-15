import { playBeepHigh, playBeepLow, playSoundError, playSoundFiltered, playSoundKO, playSoundOK } from "@/lib/audio";
import { addFrame, currentIndex, Frame, frames, getFrameCount, parseFrame, selectedFrame, setCurrentFrame, setCurrentIndex } from '@/lib/frames';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import EventSource, { MessageEvent } from 'react-native-sse';

const DEFAULT_URLS = ["http://sarsatjrx.local", "http://localhost", "http://192.168.0.83", "http://10.0.2.2", "http://10.157.161.213"];

type AppContextType = {
    // App
    time: string | null;
    sdMounted: boolean;
    discriOn: boolean;
    batteryPercentage: number | null;
    connected: boolean;
    deviceURL: string | null,
    setDeviceURL: (url: string) => void;
    savedURLs: string[],
    saveDeviceURL: (url: string) => void,
    // Frames
    frames: Frame[];
    currentFrame: Frame | null;
    currentIndex: number;
    countdown: number | null;
    addFrame: (data: Record<string, string>) => void;
    setCountdown: (countdown: number) => void;
    resetCountdown: () => void;
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
    savedURLs: [] as string[],
    saveDeviceURL: (url: string) => {},
    // Frames
    frames: [],
    currentFrame: null,
    currentIndex: 0,
    countdown: null,
    addFrame: () => {},
    setCountdown: () => {},
    resetCountdown: () => {},
    nextFrame: () => {},
    prevFrame: () => {},
});

let globalEventSource:EventSource | null = null;

let storedDeviceURL: string | null = null;

let connecting:boolean = false;

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    // Header info
    const [time, setTime] = useState<string | null>(null);
    const [sdMounted, setSdMounted] = useState<boolean>(false);
    const [discriOn, setDiscriOn] = useState<boolean>(false);
    const [batteryPercentage, setBatteryPercentage] = useState<number | null>(null);
    // Connection management
    const [deviceURL, setDeviceUrlValue] =  useState<string | null>(storedDeviceURL);
    const [savedURLs, setSavedURLs] = useState<string[]>(DEFAULT_URLS);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryDelay = useRef(1000); // 1s au départ
    const maxDelay = 5000; // 5s max
    const hasRun = useRef(false);
    const inBackground = useRef(false); // True when app is in background
    // Connection status
    const [connected, setConnected] = useState(false);
    const lastMessageRef = useRef<number>(Date.now());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Countdown
    const [countdown, setCountdownValue] = useState<number | null>(null);
    // Current frame
    const [currentFrame, updateCurrentFrame] = useState(selectedFrame);

    const setCountdown = (countdown: number) => {
        setCountdownValue(i => (countdown));
    };

    async function fetchFrames() {
        if(!storedDeviceURL) return;
        try {
            const resp = await fetch(storedDeviceURL+'/frames');
            const text = await resp.text();
            text.split("\n#\n").forEach(line => 
            {
                parseFrame(line);
                updateCurrentFrame(selectedFrame);
            });
        } catch {}
    }

    async function fetchFrame() {
        if(!storedDeviceURL) return;
        try {
            const resp = await fetch(storedDeviceURL+'/frame');
            const text = await resp.text();
            parseFrame(text);
            updateCurrentFrame(selectedFrame);
        } catch {}
    }

    async function resetCountdown() {
        if(!storedDeviceURL) return;
        try {
            // Feedback sound
            playSoundFiltered();
            // Call endpoint
            const resp = await fetch(storedDeviceURL+'/resetcd');
        } catch {
        }
    }

    const nextFrame = () => {
        setCurrentIndex(((currentIndex + 1) % frames.length));
        setCurrentFrame(frames[currentIndex]);
        updateCurrentFrame(selectedFrame);
    };

    const prevFrame = () => {
        setCurrentIndex((((currentIndex - 1) >= 0) ? (currentIndex - 1) : (frames.length-1)));
        setCurrentFrame(frames[currentIndex]);
        updateCurrentFrame(selectedFrame);
    };

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
            const parts = e.data.split("\n")[0].split(';');
            if(parts.length==4)
            {
                const valid = parts[1] === "1";
                const filtered = parts[2] === "1";
                const error = parts[3] === "1";
                //console.log("Event parts: ",parts);
                if(valid && !filtered)
                {   // Audio notification first
                    if(error)
                    {
                        playSoundKO();
                    }
                    else
                    {
                        playSoundOK();
                    }
                    parseFrame(e.data.split("\n").slice(1).join("\n"));
                    updateCurrentFrame(selectedFrame);
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
            if (reconnectTimeout.current || connecting) return;
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
        if(!storedDeviceURL) console.log("⚠️ Device URL is null on connet !");
        if(connecting) console.log("⚠️ Connetion attempt while connecting !");
        if(!storedDeviceURL || connecting) return;
        connecting = true;
        clearGlobalEventSource();
        const url = storedDeviceURL + "/sse";
        console.log("🔌 Connecting SSE to", url);
        globalEventSource = new EventSource(url);

        globalEventSource.addEventListener("open", () => {
            console.log("✅ EventSource connected");
            retryDelay.current = 1000; // reset reconnection delay
            if(getFrameCount() == 0)
            {   // No frames yet, check for frames on the decoder
                fetchFrames();
                updateCurrentFrame(selectedFrame);
            }
            // Reset watchdog timer
            lastMessageRef.current = Date.now();
            connecting = false;
        });

        globalEventSource.addEventListener("message", (event) => {
            console.log("📩 SSE received :", event.data);
            connecting = false;
            lastMessageRef.current = Date.now();
            if (!connected) setConnected(true);
            handleMessage(event);
            connecting = false;
        });

        globalEventSource.addEventListener("error", (event) => {
            console.log("⚠️ SSE error, will retry…");
            connecting = false;
            globalEventSource?.close();
            setConnected(false);
            scheduleReconnect();
        });

        globalEventSource.addEventListener("close", (event) => {
            console.log("⚠️ SSE close, will retry…");
            connecting = false;
            globalEventSource?.close();
            setConnected(false);
            scheduleReconnect();
        });

        return globalEventSource;
    };

    // 💾 Persist new device URL whenever it changes
    const setDeviceURL = async (url: string) => {
        console.log("⚠️ Settting device URL to ",url);
        setDeviceUrlValue(url);
        storedDeviceURL = url;
        // Reconnect on deviceURL change
        // Clear reconnection delay
        lastMessageRef.current = Date.now();
        // Force reconnecting
        connecting = false;
        clearReconnectTimer();
        connect();
        await AsyncStorage.setItem("lastDeviceURL", url);
    };    

    useEffect(() => {
        // Only run init stuff once
        if (hasRun.current) return;
        hasRun.current = true;

        // Load previously saved device URL
        (async () => {
            try {
                const saved = await AsyncStorage.getItem("lastDeviceURL");
                if(saved)
                {   // Reload previous value
                    console.log("⚠️ Restored device URL :", saved);
                    storedDeviceURL = saved;
                    setDeviceUrlValue(saved);
                    // Wait for deviceUrl before connection
                    connect();
                }
                else
                {   // Init to default
                    setDeviceURL("http://sarsatjrx.local");
                }
            } catch (e) {
                console.warn("Error loading device URL", e);
            }
            try {
                const stored = await AsyncStorage.getItem("deviceURLs");
                if (stored) {
                const parsed = JSON.parse(stored);
                setSavedURLs([...new Set([...DEFAULT_URLS, ...parsed])]);
                }
            } catch (err) {
                console.warn("Error loading stored URLs", err);
            }
        })();

        // Check periodically if messages are still coming
        timeoutRef.current = setInterval(() => {
            const delta = Date.now() - lastMessageRef.current;
            if ((!connecting && delta > 3000) || (connecting && delta > 5000)) {
                console.log("⚠️ Connection lost, reconnecting…");
                connecting = false;
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

    // 💾 Save selected or entered URL
    const saveDeviceURL = async (url: string) => {
        if (!url || url.trim().length < 5) return;
        url = url.trim().replace(/\/$/, "");
        if(!url.startsWith("http://")) url = "http://" + url;
        const newList = [...new Set([url, ...savedURLs])];
        setSavedURLs(newList);
        setDeviceURL(url);
        await AsyncStorage.setItem("deviceURLs", JSON.stringify(newList));
    };

  return (
    <AppContext.Provider value={{ time, sdMounted, discriOn, batteryPercentage, connected, deviceURL, setDeviceURL, savedURLs, saveDeviceURL, frames, currentFrame, currentIndex, countdown, addFrame, setCountdown, resetCountdown, nextFrame, prevFrame }}>
      {children}
    </AppContext.Provider>
  );
};