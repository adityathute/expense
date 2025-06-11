// components/common/HeaderWithNewButton.js

import React from "react";
// import "../components.css";

const HeaderWithNewButton = ({ title, buttonLabel, onClick }) => {
  return (
    <div className="HeaderActionBar">
      <h3 className="HeaderActionBar-h-block">{title}</h3>
      <div className="HeaderActionBar-btn-block" onClick={onClick}>
        <button className="HeaderActionBar-btn">+&nbsp;&nbsp;{buttonLabel}</button>
      </div>
    </div>
  );
};

export default HeaderWithNewButton;
