import { Asset } from "expo-asset";
import { AudioModule, useAudioPlayer } from 'expo-audio';
import { Platform, Vibration } from 'react-native';

let countdownBeepOn: boolean = true;
let audioFrameNotifOn: boolean = true;
let vibrateFrameNotifOn: boolean = true;

export function setCountDownBeep(on:boolean)
{
    countdownBeepOn = on;
}

export function setAudioFrameNotif(on:boolean)
{
    audioFrameNotifOn = on;
}

export function setVibrateFrameNotif(on:boolean)
{
    vibrateFrameNotifOn = on;
}

export function useAudioAsset(assetId: number) {
    const platform = Platform.OS;
    const getAudioSource = () => {
        console.log("getAudioSource for ",assetId);
        if (!__DEV__ && platform === "android") {
        const assetinfo = Asset.fromModule(assetId);
        console.log("Android no dev => URI = ",assetinfo.localUri);
        const rawPath = assetinfo.localUri?.replace("file://", "");
        console.log("Raw path = ",rawPath);
        if (!rawPath) return assetId;
        return { uri: rawPath };
        }
        return assetId;
    };
    const player = useAudioPlayer(getAudioSource(), { updateInterval: 1000, downloadFirst: true });
    if(platform !== "web")
    {
        // Force loading sound now, silently, but not 0 because it doesn't work...
        player.volume = 0.0000000001;
        player.play();
    }
    return player;
}

initAudio();

const soundOK = useAudioAsset(require('@/assets/audios/ok.mp3'));
const soundKO = useAudioAsset(require('@/assets/audios/ko.mp3'));
const soundError = useAudioAsset(require('@/assets/audios/invalid.mp3'));
const soundFiltered = useAudioAsset(require('@/assets/audios/filtered.mp3'));
const beepHigh = useAudioAsset(require('@/assets/audios/counth.mp3'));
const beepLow = useAudioAsset(require('@/assets/audios/countl.mp3'));

export function playSoundOK() {
    if(audioFrameNotifOn)
    {
        soundOK.volume = 1;
        soundOK.seekTo(0);
        soundOK.play();
    }
    if(vibrateFrameNotifOn)
    {
        Vibration.vibrate(500);
    }
}

export function playSoundKO() {
    if(audioFrameNotifOn)
    {
        soundKO.volume = 1;
        soundKO.seekTo(0);
        soundKO.play();
    }
    if(vibrateFrameNotifOn)
    {
        Vibration.vibrate([0, 200, 100, 200]); 
    }
}

export function playSoundError() {
    if(audioFrameNotifOn)
    {
        soundError.volume = 1;
        soundError.seekTo(0);
        soundError.play();
    }
    if(vibrateFrameNotifOn)
    {
        Vibration.vibrate([0, 200, 100, 200]); 
    }
}

export function playSoundFiltered() {
    if(audioFrameNotifOn)
    {
        soundFiltered.volume = 1;
        soundFiltered.seekTo(0);
        soundFiltered.play();
    }
    if(vibrateFrameNotifOn)
    {
        Vibration.vibrate([0, 200, 100, 200]); 
    }
}

export function playBeepHigh() {
    if(countdownBeepOn)
    {
        beepHigh.volume = 1;
        beepHigh.seekTo(0);
        beepHigh.play();
    }
}

export function playBeepLow() {
    if(countdownBeepOn)
    {
        beepLow.volume = 1;
        beepLow.seekTo(0);
        beepLow.play();
    }
}

export function initAudio() {
    AudioModule.setAudioModeAsync({
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
    });
}

