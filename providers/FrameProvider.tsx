import React, { createContext, useState } from 'react';

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

type FrameContextType = {
  frames: Frame[];
  currentFrame: Frame | null;
  currentIndex: number;
  countdown: number | null;
  addFrame: (data: Record<string, string>) => void;
  setCountdown: (countdown: number) => void;
  nextFrame: () => void;
  prevFrame: () => void;
};

export const FrameContext = createContext<FrameContextType>({
  frames: [],
  currentFrame: null,
  currentIndex: 0,
  countdown: null,
  addFrame: () => {},
  setCountdown: () => {},
  nextFrame: () => {},
  prevFrame: () => {},
});

export const FrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState<Frame| null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdownValue] = useState<number | null>(null);

  const addFrame = (data: Record<string, string>) => {
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
    setFrames(prev => {
      const newFrames = [...prev, newFrame];
      setCurrentFrame(newFrame);
      setCurrentIndex(newFrames.length - 1); // move to latest frame
      return newFrames;
    });
  };

  const setCountdown = (countdown: number) => {
    setCountdownValue(i => (countdown));
  };

  const nextFrame = () => {
    setCurrentIndex(i => ((i + 1) % frames.length));
    setCurrentFrame(frames[currentIndex]);
  };

  const prevFrame = () => {
    setCurrentIndex(i => (((i - 1) >= 0) ? (i - 1) : (frames.length-1)));
    setCurrentFrame(frames[currentIndex]);
  };

  return (
    <FrameContext.Provider value={{ frames, currentFrame, currentIndex, countdown, addFrame, setCountdown, nextFrame, prevFrame }}>
      {children}
    </FrameContext.Provider>
  );
};