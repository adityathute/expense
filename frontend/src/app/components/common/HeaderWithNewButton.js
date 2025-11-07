// components/common/HeaderWithNewButton.js
import React from "react";
import "../../styles/components/components.css";

const HeaderWithNewButton = ({ title, buttonLabel, onClick, buttons }) => {
  const hasButtons = (buttons && buttons.length > 0) || (buttonLabel && onClick);

  return (
    <div className="HeaderActionBar">
      <h3 className="HeaderActionBar-h-block">{title}</h3>
      {hasButtons && (
        <div className="HeaderActionBar-btn-block">
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
            <button className="HeaderActionBar-btn" onClick={onClick}>
              +&nbsp;&nbsp;{buttonLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderWithNewButton;
