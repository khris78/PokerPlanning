import React from 'react';
import './Messages.css'

function Messages(props) {
  return (
    <div className="pkr_messages">
      {props.msg.map((curMsg) => <li key={curMsg}>{curMsg}</li>)}
    </div> 
  );
}

export default Messages;