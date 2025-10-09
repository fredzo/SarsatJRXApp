import { AudioModule, useAudioPlayer } from 'expo-audio';

const soundOK = useAudioPlayer(require('../assets/ok.mp3'));
const soundKO = useAudioPlayer(require('../assets/ko.mp3'));
const soundError = useAudioPlayer(require('../assets/invalid.mp3'));
const soundFiltered = useAudioPlayer(require('../assets/filtered.mp3'));
const beepHigh = useAudioPlayer(require('../assets/counth.mp3'));
const beepLow = useAudioPlayer(require('../assets/countl.mp3'));

export function playSoundOK() {
    soundOK.seekTo(0);
    soundOK.play();
    setTimeout(() => {
        soundOK.pause();
    }, 250); // Pause sound at the end to stop ducking other audio sources

}

export function playSoundKO() {
    soundKO.seekTo(0);
    soundKO.play();
    setTimeout(() => {
        soundKO.pause();
    }, 250); // Pause sound at the end to stop ducking other audio sources
}

export function playSoundError() {
    soundError.seekTo(0);
    soundError.play();
    setTimeout(() => {
        soundError.pause();
    }, 350); // Pause sound at the end to stop ducking other audio sources
}

export function playSoundFiltered() {
    soundFiltered.seekTo(0);
    soundFiltered.play();
    setTimeout(() => {
        soundFiltered.pause();
    }, 350); // Pause sound at the end to stop ducking other audio sources
}

export function playBeepHigh() {
    beepHigh.seekTo(0);
    beepHigh.play();
    setTimeout(() => {
        beepHigh.pause();
    }, 300); // Pause sound at the end to stop ducking other audio sources
}

export function playBeepLow() {
    beepLow.seekTo(0);
    beepLow.play();
    setTimeout(() => {
        beepLow.pause();
    }, 300); // Pause sound at the end to stop ducking other audio sources
}

export function initAudio() {
    console.log("MP3!!!!!!",require("../assets/ok.mp3"));
    AudioModule.setAudioModeAsync({
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
    });
}

