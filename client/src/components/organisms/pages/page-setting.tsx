// PageSettings.tsx
import React from 'react';

interface PageSettingsProps {
  orientation: 'portrait' | 'landscape';
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  margin: number;
  setMargin: (margin: number) => void;
}

const PageSettings: React.FC<PageSettingsProps> = ({ orientation, setOrientation, margin, setMargin }) => {
  return (
    <div className="page-settings">
      <label>
        Orientation:
        <select value={orientation} onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>
      <label>
        Margin:
        <input
          type="number"
          value={margin}
          onChange={(e) => setMargin(Number(e.target.value))}
          min={10}
          max={100}
        /> px
      </label>
    </div>
  );
};

export default PageSettings;