import { FrameContext } from "@/providers/FrameProvider";
import { useAudioPlayer } from 'expo-audio';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import EventSource, { MessageEvent } from 'react-native-sse';

//const DEVICE_URL = 'http://sarsatjrx.local';
const DEVICE_URL = 'http://localhost';
//const DEVICE_URL = 'http://10.0.2.2';
//const DEVICE_URL = 'http://10.157.161.213';

type AppContextType = {
  eventSource: EventSource | null;
};

export const AppContext = createContext<AppContextType>({
  eventSource: null,
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const { frames, addFrame, setCountdown } = useContext(FrameContext);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryDelay = useRef(1000); // 1s au départ
    const maxDelay = 5000; // 5s max
    const hasRun = useRef(false);

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

    const soundOK = useAudioPlayer(require('../assets/beep.wav'));
    const soundKO = useAudioPlayer(require('../assets/beep.wav'));
    const soundError = useAudioPlayer(require('../assets/beep.wav'));

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
            if(parts.length==3)
            {
                const val = parseInt(parts[1]);
                setCountdown(val);
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

        const es = connect();

        return () => {
            // Keep resources since app context can be reloaded on frame provider changes
            /*console.log("👋 Closing EventSource");
            es.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);*/
        };
    }, [fetchFrames]);

  return (
    <AppContext.Provider value={{ eventSource }}>
      {children}
    </AppContext.Provider>
  );
};