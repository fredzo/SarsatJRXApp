import React, { createContext, useState } from 'react';

export type Frame = {
  lon: number | null; 
  lat: number | null;
  data: Record<string, string>;
};

type FrameContextType = {
  frames: Frame[];
  currentIndex: number;
  addFrame: (data: Record<string, string>) => void;
  nextFrame: () => void;
  prevFrame: () => void;
};

export const FrameContext = createContext<FrameContextType>({
  frames: [],
  currentIndex: 0,
  addFrame: () => {},
  nextFrame: () => {},
  prevFrame: () => {},
});

export const FrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addFrame = (data: Record<string, string>) => {
    let frameLat = null;
    let frameLon = null;
    if (data['lat'] && data['lon']) {
      const lat = parseFloat(data['lat']);
      const lon = parseFloat(data['lon']);
      if (!isNaN(lat) && !isNaN(lon)) {
        frameLat = lat;
        frameLon = lon;
      }
    }
    const newFrame: Frame = {lat:frameLat, lon:frameLon, data};

    setFrames(prev => {
      const newFrames = [...prev, newFrame];
      setCurrentIndex(newFrames.length - 1); // move to latest frame
      return newFrames;
    });
  };

  const nextFrame = () => {
    setCurrentIndex(i => Math.min(i + 1, frames.length - 1));
  };

  const prevFrame = () => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  };

  return (
    <FrameContext.Provider value={{ frames, currentIndex, addFrame, nextFrame, prevFrame }}>
      {children}
    </FrameContext.Provider>
  );
};
