
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
export let selectedFrame: Frame | null;
export let currentIndex: number;

export function setCurrentIndex(index:number) {
  //console.log("Set current index = ",index);
  currentIndex = index;
}

export function setCurrentFrame(frame:Frame| null) {
  //console.log("Set current frame ", frame?.data.title);
  selectedFrame = frame;
}

export function getFrameCount() {
  return frames.length;
}

export function parseFrame(frameData: string) {
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