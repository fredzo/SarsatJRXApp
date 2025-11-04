import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { AudioModule, useAudioPlayer } from 'expo-audio';
import { Platform, Vibration } from 'react-native';

var countdownBeepOn: boolean = false;
var audioFrameNotifOn: boolean = true;
var vibrateFrameNotifOn: boolean = true;
var audioFeedbackOn: boolean = true;
var vibrateFeedbackOn: boolean = true;

const AUDIO_COUNTDOWN_PREF = 'audioCountdown';
const AUDIO_FRAME_NOTIF_PREF = 'audioFrameNotif';
const VIBRATION_FRAME_NOTIF_PREF = 'vibrationFrameNotif';
const AUDIO_FEEDBACK_PREF = 'audioFeedback';
const VIBRATION_FEEDBACK_PREF = 'vibrationFeedback';


export async function setCountDownBeep(on:boolean)
{
    countdownBeepOn = on;
    await AsyncStorage.setItem(AUDIO_COUNTDOWN_PREF, String(on));
}

export function getCountDownBeep():boolean
{
    return countdownBeepOn;
}

export async function setAudioFrameNotif(on:boolean)
{
    audioFrameNotifOn = on;
    await AsyncStorage.setItem(AUDIO_FRAME_NOTIF_PREF, String(on));
}

export function getAudioNotif():boolean
{
    return audioFrameNotifOn;
}

export async function setVibrateFrameNotif(on:boolean)
{
    vibrateFrameNotifOn = on;
    await AsyncStorage.setItem(VIBRATION_FRAME_NOTIF_PREF, String(on));
}

export function getVibrateNotif():boolean
{
    return vibrateFrameNotifOn;
}

export async function setAudioFeedback(on:boolean)
{
    audioFeedbackOn = on;
    await AsyncStorage.setItem(AUDIO_FEEDBACK_PREF, String(on));
}

export function getAudioFeedback():boolean
{
    return audioFeedbackOn;
}

export async function setVibrateFeendback(on:boolean)
{
    vibrateFeedbackOn = on;
    await AsyncStorage.setItem(VIBRATION_FEEDBACK_PREF, String(on));
}

export function getVibrateFeedback():boolean
{
    return vibrateFeedbackOn;
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
        Vibration.vibrate([0,500,0,0]);
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

export function feedbackNotification() {
    if(audioFeedbackOn)
    {
        soundFiltered.volume = 1;
        soundFiltered.seekTo(0);
        soundFiltered.play();
    }
    if(vibrateFeedbackOn)
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

export async function initAudio() {
    AudioModule.setAudioModeAsync({
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
    });
    try {
        // Countdown
        const countdown = await AsyncStorage.getItem(AUDIO_COUNTDOWN_PREF);
        if (countdown !== null) countdownBeepOn = (countdown === 'true');
        // Frame
        const frame = await AsyncStorage.getItem(AUDIO_FRAME_NOTIF_PREF);
        if (frame !== null) audioFrameNotifOn = (frame === 'true');
        const frameVibration = await AsyncStorage.getItem(VIBRATION_FRAME_NOTIF_PREF);
        if (frameVibration !== null) vibrateFrameNotifOn = (frameVibration === 'true');
        // Feedback
        const audioFeedback = await AsyncStorage.getItem(AUDIO_FEEDBACK_PREF);
        if (audioFeedback !== null) audioFeedbackOn = (audioFeedback === 'true');
        const vibrationFeedback = await AsyncStorage.getItem(VIBRATION_FEEDBACK_PREF);
        if (vibrationFeedback !== null) vibrateFeedbackOn = (vibrationFeedback === 'true');
    } catch (err) {
        console.warn("Error loading notification settings", err);
    }
}

