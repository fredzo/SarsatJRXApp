import { FrameContext } from "@/providers/FrameProvider";
import { AudioModule, useAudioPlayer } from 'expo-audio';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import EventSource, { MessageEvent } from 'react-native-sse';

//const DEVICE_URL = 'http://sarsatjrx.local';
const DEVICE_URL = 'http://localhost';
//const DEVICE_URL = 'http://10.0.2.2';
//const DEVICE_URL = 'http://10.157.161.213';

type AppContextType = {
  eventSource: EventSource | null;
  time: string | null;
  sdMounted: boolean;
  discriOn: boolean;
  batteryPercentage: number | null;
};

export const AppContext = createContext<AppContextType>({
  eventSource: null,
  time: null,
  sdMounted: false,
  discriOn: false,
  batteryPercentage: null,
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [sdMounted, setSdMounted] = useState<boolean>(false);
    const [discriOn, setDiscriOn] = useState<boolean>(false);
    const [batteryPercentage, setBatteryPercentage] = useState<number | null>(null);
    const { frames, addFrame, setCountdown } = useContext(FrameContext);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryDelay = useRef(1000); // 1s au départ
    const maxDelay = 5000; // 5s max
    const hasRun = useRef(false);
    const inBackground = useRef(false); // True when app is in background

    const clearReconnectTimer = () => {
        if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
        }
    };

    const scheduleReconnect = () => {
            clearReconnectTimer();
            console.log(`🔁 Reconnection attempt in ${retryDelay.current / 1000}s...`);
            reconnectTimeout.current = setTimeout(() => {
            reconnectTimeout.current = null;
            connect();
        }, retryDelay.current);

        // Exponential reconnection delay
        retryDelay.current = Math.min(retryDelay.current * 2, maxDelay);
    };

    const soundOK = useAudioPlayer(require('../assets/ok.mp3'));
    const soundKO = useAudioPlayer(require('../assets/ko.mp3'));
    const soundError = useAudioPlayer(require('../assets/invalid.mp3'));
    const beepHigh = useAudioPlayer(require('../assets/counth.mp3'));
    const beepLow = useAudioPlayer(require('../assets/countl.mp3'));

    function playSoundOK() {
        soundOK.seekTo(0);
        soundOK.play();
    }

    function playSoundKO() {
        soundKO.seekTo(0);
        soundKO.play();
    }

    function playSoundError() {
        soundError.seekTo(0);
        soundError.play();
    }

    function playBeepHigh() {
        beepHigh.seekTo(0);
        beepHigh.play();
    }

    function playBeepLow() {
        beepLow.seekTo(0);
        beepLow.play();
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
            playSoundOK();
            //console.log("Event data: ",e.data);
            parseFrame(e.data.split("\n").slice(1).join("\n"));
        }
    };

    const connect = () => {
        clearReconnectTimer();
        console.log("🔌 EventSource connection...");
        const es = new EventSource(DEVICE_URL+"/sse");

        es.addEventListener("open", () => {
            console.log("✅ EventSource connected");
            retryDelay.current = 1000; // reset reconnection delay
            setEventSource(es);
            if(frames.length == 0)
            {   // No frames yet, check for frames on the decoder
                fetchFrames();
            }
        });

        es.addEventListener("message", (event) => {
            console.log("📩 SSE received :", event.data);
            handleMessage(event);
        });

        es.addEventListener("error", (event) => {
            console.log("⚠️ SSE error, will retry…");
            es.close();
            setEventSource(null);
            scheduleReconnect();
        });

        return es;
    };

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        // Fetch frames is done on SSE connection
        //fetchFrames();

        AudioModule.setAudioModeAsync({
            shouldPlayInBackground: true,
            interruptionMode: 'duckOthers',
            interruptionModeAndroid: 'duckOthers',
            playsInSilentMode: true,
            shouldRouteThroughEarpiece: true,
        });

        const es = connect();

        const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
            inBackground.current = false;
            connect();
        } else if (state === "background") {
            inBackground.current = true;
        }
        });

        return () => {
            // Keep resources since app context can be reloaded on frame provider changes
            /*console.log("👋 Closing EventSource");
            es.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);*/
        };
    }, [fetchFrames]);

  return (
    <AppContext.Provider value={{ eventSource, time, sdMounted, discriOn, batteryPercentage }}>
      {children}
    </AppContext.Provider>
  );
};