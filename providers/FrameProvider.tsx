import React, { createContext, useState } from 'react';

type Coords = { latitude: number; longitude: number } | null;

type FrameContextType = {
  frame: Record<string, string> | null;
  coords: Coords;
  setFrame: (data: Record<string, string>) => void;
};

export const FrameContext = createContext<FrameContextType>({
  frame: null,
  coords: null,
  setFrame: () => {},
});

export const FrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frame, setFrameState] = useState<Record<string, string> | null>(null);
  const [coords, setCoords] = useState<Coords>(null);

  const setFrame = (data: Record<string, string>) => {
    setFrameState(data);
    if (data['lat'] && data['lon']) {
      const lat = parseFloat(data['lat']);
      const lon = parseFloat(data['lon']);
      if (!isNaN(lat) && !isNaN(lon)) {
        setCoords({ latitude: lat, longitude: lon });
      }
    }
  };

  return (
    <FrameContext.Provider value={{ frame, coords, setFrame }}>
      {children}
    </FrameContext.Provider>
  );
};
