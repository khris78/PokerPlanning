import React from 'react';
import Card from '../Card/Card'
import './CardPack.css'

function CardPack(props) {
  return (
    <div className="pkr_cardPack">
      {props.cards.map((cardValue) => <Card key={cardValue} 
                                            value={cardValue} 
                                            selected={cardValue === props.selected}
                                            finalSelection={cardValue === props.finalSelection}
                                            onClick={props.onClick}
                                            />)}
    </div> 
  );
}

export default CardPack;