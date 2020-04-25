import React from 'react';
import './Card.css'

function Card(props) {
  return (
    <div className={"pkr_card" + (props.selected ? ' pkr_card_selected' : '') + (props.finalSelection ? ' pkr_card_final_selection' : '')}
         onClick={() => { if (props.onClick) props.onClick(props.value); }}>
      {props.value}
    </div> 
  );
}

export default Card;