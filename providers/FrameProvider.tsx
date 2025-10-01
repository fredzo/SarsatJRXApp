import React, { createContext, useState } from 'react';

type Coords = { latitude: number; longitude: number } | null;

type FrameContextType = {
  frames: Record<string, string>[];
  currentIndex: number;
  coords: Coords;
  addFrame: (data: Record<string, string>) => void;
  nextFrame: () => void;
  prevFrame: () => void;
};

export const FrameContext = createContext<FrameContextType>({
  frames: [],
  currentIndex: 0,
  coords: null,
  addFrame: () => {},
  nextFrame: () => {},
  prevFrame: () => {},
});

export const FrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frames, setFrames] = useState<Record<string, string>[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coords, setCoords] = useState<Coords>(null);

  const addFrame = (data: Record<string, string>) => {
    setFrames(prev => {
      const newFrames = [...prev, data];
      setCurrentIndex(newFrames.length - 1); // move to latest frame
      return newFrames;
    });
    if (data['lat'] && data['lon']) {
      const lat = parseFloat(data['lat']);
      const lon = parseFloat(data['lon']);
      if (!isNaN(lat) && !isNaN(lon)) {
        setCoords({ latitude: lat, longitude: lon });
      }
    }
  };

  const nextFrame = () => {
    setCurrentIndex(i => Math.min(i + 1, frames.length - 1));
  };

  const prevFrame = () => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  };

  return (
    <FrameContext.Provider value={{ frames, currentIndex, coords, addFrame, nextFrame, prevFrame }}>
      {children}
    </FrameContext.Provider>
  );
};
