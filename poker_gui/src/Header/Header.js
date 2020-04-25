import React from 'react';
import './Header.css'

function Header(props) {
  return (
    <div className="header">
      <span className="title">Poker Planning</span>&nbsp;
      <span className="version">beta</span>
      { props.room ? 
        <span className="exit" onClick={() => props.onExitRoom()}>{"\u23FB"}</span>
        : null
      }
    </div>
  );
}

export default Header;