import { Asset } from "expo-asset";
import { AudioModule, useAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

export function useAudioAsset(assetId: number) {
  const platform = Platform.OS;
  const getAudioSource = () => {
    console.log("getAudioSource for ",assetId);
    if (!__DEV__ && platform === "android") {
      const assetinfo = Asset.fromModule(assetId);
      console.log("Android no dev => URI = ",assetinfo.localUri);
      const rawPath = assetinfo.localUri?.replace("file://", "");
      console.log("Raw path = ",rawPath);
      if (!rawPath) return;
      return { uri: rawPath };
    }
    return assetId;
  };

  const player = useAudioPlayer(getAudioSource());

  return player;
}

const soundOK = useAudioAsset(require('@/assets/audios/ok.mp3'));
const soundKO = useAudioAsset(require('@/assets/audios/ko.mp3'));
const soundError = useAudioAsset(require('@/assets/audios/invalid.mp3'));
const soundFiltered = useAudioAsset(require('@/assets/audios/filtered.mp3'));
const beepHigh = useAudioAsset(require('@/assets/audios/counth.mp3'));
const beepLow = useAudioAsset(require('@/assets/audios/countl.mp3'));

export function playSoundOK() {
    soundOK.seekTo(0);
    soundOK.play();
    setTimeout(() => {
        soundOK.pause();
    }, 350); // Pause sound at the end to stop ducking other audio sources

}

export function playSoundKO() {
    soundKO.seekTo(0);
    soundKO.play();
    setTimeout(() => {
        soundKO.pause();
    }, 350); // Pause sound at the end to stop ducking other audio sources
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
    AudioModule.setAudioModeAsync({
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
    });
}

