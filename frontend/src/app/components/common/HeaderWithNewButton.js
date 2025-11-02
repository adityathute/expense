// components/common/HeaderWithNewButton.js
import React from "react";
import "../../styles/components/components.css";

const HeaderWithNewButton = ({ title, buttonLabel, onClick, buttons }) => {
  return (
    <div className="HeaderActionBar">
      <h3 className="HeaderActionBar-h-block">{title}</h3>
      <div className="HeaderActionBar-btn-block">
        {/* If multiple buttons provided, render them */}
        {buttons && buttons.length > 0 ? (
          buttons.map((btn, index) => (
            <button
              key={index}
              className="HeaderActionBar-btn"
              onClick={btn.onClick}
            >
              +&nbsp;&nbsp;{btn.label}
            </button>
          ))
        ) : (
          // fallback to single button mode (old behavior)
          <button className="HeaderActionBar-btn" onClick={onClick}>
            +&nbsp;&nbsp;{buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default HeaderWithNewButton;
