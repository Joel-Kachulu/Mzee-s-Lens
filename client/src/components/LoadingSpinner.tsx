import React from 'react';
import '../static/loading.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner-brand">Mzee's Lens</div>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
