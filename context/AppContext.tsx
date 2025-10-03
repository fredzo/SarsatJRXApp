import { FrameContext } from "@/providers/FrameProvider";
import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

//const DEVICE_URL = 'http://sarsatjrx.local';
const DEVICE_URL = 'http://localhost';
//const DEVICE_URL = 'http://10.0.2.2';

type AppContextType = {
  eventSource: EventSource | null;
};

export const AppContext = createContext<AppContextType>({
  eventSource: null,
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const { addFrame, setCountdown } = useContext(FrameContext);
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

    const soundOK = new Audio.Sound();
    const soundKO = new Audio.Sound();
    const soundError = new Audio.Sound();

    async function loadSounds() 
    {
        try {
            if(!soundOK._loaded) await soundOK.loadAsync(require('../assets/beep.wav'));
            if(!soundKO._loaded) await soundKO.loadAsync(require('../assets/beep.wav'));
            if(!soundError._loaded) await soundError.loadAsync(require('../assets/beep.wav'));
        } catch (error){
            console.log("Error while loading sounds :",error);
        }
    }

    async function unloadSounds() 
    {
        try {
            if(soundOK._loaded) await soundOK.unloadAsync();
            if(soundKO._loaded) await soundKO.unloadAsync();
            if(soundError._loaded) await soundError.unloadAsync();
        } catch (error){
            console.log("Error while unloading sounds :",error);
        }
    }

    async function playSoundOK() {
        try {
            await soundOK.playAsync();
        } catch (error){
            console.log("Error when playing OK sound :",error);
        }
    }

    async function playSoundKO() {
        try {
            await soundKO.playAsync();
        } catch (error){
            console.log("Error when playing KO sound :",error);
        }
    }

    async function playSoundError() {
        try {
            await soundError.playAsync();
        } catch (error){
            console.log("Error when playing Error sound :",error);
        }
    }

    async function fetchFrames() {
        try {
            const resp = await fetch(DEVICE_URL+'/frames');
            const text = await resp.text();
            text.split("#\n").forEach(line => 
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
                const [key, value] = line.split('=');
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
        loadSounds();
        fetchFrames();

        const es = connect();

        return () => {
            // Keep resources since app context can be reloaded on frame provider changes
            /*console.log("👋 Closing EventSource");
            es.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            unloadSounds();*/
        };
    }, [loadSounds, fetchFrames, unloadSounds]);

  return (
    <AppContext.Provider value={{ eventSource }}>
      {children}
    </AppContext.Provider>
  );
};