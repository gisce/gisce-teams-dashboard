import React, { createContext, useState, useEffect } from 'react';
import ApiClient from '../Services/ApiClient';

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [graphColors, setGraphColors] = useState({
    // Define tus colores predeterminados aquí
    draft: 'lightgray',
    open: 'lightgreen',
    pending: 'lightyellow',
    cancelled: 'lightcoral',
    done: 'lightgray',
  });

  useEffect(() => {
    async function fetchColors() {
      try {
        const result = await ApiClient.get(
            "/ProjectTaskStage?schema=name,color.hex_code"
        );
        const stages = result.data.items;
        const colors = stages.reduce((acc, stage) => {
          acc[stage.name] = '#' + stage.color.hex_code;
          return acc;
        }, {});

        setGraphColors(colors);
      } catch (error) {
        console.error('Error fetching colors:', error);
      }
    }

    fetchColors();
  }, []);

  return (
    <ColorContext.Provider value={graphColors}>
      {children}
    </ColorContext.Provider>
  );
};
