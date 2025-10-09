
export enum FrameState {
  OK = "OK",
  KO = "KO",
  INVALID = "Invalid",
}

export type Frame = {
  lat: number;
  lon: number;
  hasLocation: boolean;
  bch1Ok: boolean;
  bch2Ok: boolean;
  state: FrameState;
  data: Record<string, string>;
};

export let frames:Frame[] = [];
export let currentFrame: Frame | null;
export let currentIndex: number;

export function setCurrentIndex(index:number) {
  currentIndex = index;
}

export function setCurrentFrame(frame:Frame| null) {
  currentFrame = frame;
}

export function getFrameCount() {
  return frames.length;
}

export const addFrame = (data: Record<string, string>) => {
  let frameLat = 0;
  let frameLon = 0;
  let hasLocation = false;
  if (data['lat'] && data['lon']) {
    const lat = parseFloat(data['lat']);
    const lon = parseFloat(data['lon']);
    if (!isNaN(lat) && !isNaN(lon)) {
      frameLat = lat;
      frameLon = lon;
      hasLocation = true;
    }
  }
  const bch1Ok = (!!data.bch1 && (data.bch1.toUpperCase() === "OK"));
  const bch2Ok = (!!data.bch2 && (data.bch2.toUpperCase() === "OK"));
  const state = ((!bch1Ok) || (data.bch2 && !bch2Ok)) ? FrameState.KO : FrameState.OK;
  const newFrame: Frame = {lat:frameLat, lon:frameLon, hasLocation, bch1Ok, bch2Ok, state, data};
  frames = [...frames, newFrame];
  setCurrentFrame(newFrame);
  setCurrentIndex(frames.length - 1); // move to latest frame
};

export const nextFrame = () => {
    setCurrentIndex(((currentIndex + 1) % frames.length));
    setCurrentFrame(frames[currentIndex]);
};

export const prevFrame = () => {
    setCurrentIndex((((currentIndex - 1) >= 0) ? (currentIndex - 1) : (frames.length-1)));
    setCurrentFrame(frames[currentIndex]);
};