// BatteryLoading.jsx
import React from "react";
import "../../css/BatteryLoading.css"; // We'll create this CSS file

const BatteryLoading = () => {
  return (
    <div className="battery-loading-container">
      <div className="battery-loading-scene">
        <span className="battery-loading-label">Calculating your energy score...</span>
        <div className="battery-outline">
          {/* Battery main container */}
          <div className="battery-body">
            {/* Battery segments - representing charge levels */}
            <div className="battery-segments" style={{ "--columns": "10% 10% 10% 10% 10% 10% 10% 10% 10% 10%" }}>
              {/* 10 segments for battery levels */}
              <div style={{ "--name": "battery-segment-1", "--delay": 0, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-2", "--delay": 10, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-3", "--delay": 20, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-4", "--delay": 30, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-5", "--delay": 40, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-6", "--delay": 50, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-7", "--delay": 60, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-8", "--delay": 70, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-9", "--delay": 80, "--length": 10 }} className="battery-segment"></div>
              <div style={{ "--name": "battery-segment-10", "--delay": 90, "--length": 10 }} className="battery-segment"></div>
            </div>
          </div>
          {/* Battery tip */}
          <div className="battery-tip"></div>
        </div>
        <div className="battery-percentage">0%</div>
      </div>
    </div>
  );
};

export default BatteryLoading;