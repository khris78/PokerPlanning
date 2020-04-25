import React from 'react';
import './Timer.css'

function Timer(props) {
  return (
    <div className="pkr_timer">
      {props.timerCount}
    </div> 
  );
}

export default Timer;