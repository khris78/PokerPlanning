import React from 'react';
import CardPack from '../CardPack/CardPack';
import Attendees from '../Attendees/Attendees';
import "./Room.css"

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextVoteName: '',
    }
  }

  render() {
    return (
      <>
        <h2>{this.props.room} {this.props.voteName ? ': ' + this.props.voteName: ''}</h2>
        <div className="pkr_room_container">
          <div className="pkr_room_cards_n_actions">
            <div className="pkr_room_cards">
              { this.props.voteName ? 
                  <CardPack
                        cards={this.props.cards}
                        selected={this.props.userVote}
                        finalSelection={this.props.turnResult}
                        onClick={this.props.onClickCard}
                    />
                : <h4>Aucun vote en cours</h4>
              }
            </div>
            { this.props.isRoomOwner ?
              <div className="pkr_master_actions">
                <h4>Bravo, tu es le maître du jeu</h4>
                <button onClick={() => this.props.onOwnerAction('EndTurn', this.state.nextVoteName)}>
                  Terminer le tour
                </button>
                <button onClick={() => this.props.onOwnerAction('NewTurn', this.state.nextVoteName)}>
                  Lancer un nouveau tour
                </button>
                <br/>
                Passer au vote suivant : 
                <input type="text" 
                      value={this.state.nextVoteName} 
                      onChange={(event) => this.handleNextVoteNameChange(event)}/>
                <button onClick={() => this.props.onOwnerAction('NewVote', this.state.nextVoteName)}
                        disabled={!this.state.nextVoteName}>
                  Allons-y !
                </button>
                <br/>
              </div>
              : null
            }
          </div>
          <div className="pkr_attendee">
          <Attendees attendees={this.props.attendees}/>
          </div>
        </div>
{/*
        <div classname="pkr_room_horiz">
          <div className="pkr_room_vertical">
            <CardPack
                cards={this.props.cards}
                selected={this.props.userVote}
                onClick={this.props.onClickCard}
            />
          </div>
          <Attendees attendees={this.props.attendees}/>
        </div>
*/}
      </>
    );
  }

  handleNextVoteNameChange(event) {
    this.setState({nextVoteName: event.target.value});
  }
}

export default Room;