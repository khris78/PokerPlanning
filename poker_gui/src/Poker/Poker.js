import React from 'react';
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import "./Poker.css"
import Room from '../Room/Room';
import Messages from '../Messages/Messages';
import LoginForm from '../LoginForm/LoginForm';

class Poker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      msg:[],
      username: '',
      room: '',
      isRoomOwner: true,
      cards: [ "0", "\u00BD", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?", "\u2615" ],
      attendees: [ ],
      userVote: null,
      voteName: 'Test',
      nextVoteName: null,
      extra: null,
      turnNumber : null,
      turnStatus : null,
      turnResult : null,
      timerCount: 0,
    };
  }

  render() {
    return (
      <div className="container">
        { /* <Timer timerCount={this.state.timerCount}/> */ }
        <Header username={this.state.username}
                room={this.state.room}
                onExitRoom={() => this.handleExitRoom()}
        />
        <div className="content">
          { (this.state.msg && this.state.msg.length > 0) ?
          <Messages msg={this.state.msg}/>
          : null
          }
          { (!this.state.username || !this.state.room) ? 
            <LoginForm username={this.state.username}
                       onLogin={(action, username, room, password, isOwner, cardset) => this.handleLogin(action, username, room, password, isOwner, cardset)}

            />
            : null
          }
          { this.state.username && this.state.room ?
            <Room
                room={this.state.room}
                voteName={this.state.voteName}
                cards={this.state.cards}
                userVote={this.state.userVote}
                onClickCard={i => this.handleVoteForACard(i)}
                isRoomOwner={this.state.isRoomOwner}
                nextVoteName={this.state.nextVoteName}
                onOwnerAction={(action, voteName) => this.handleOwnerAction(action, voteName)}
                attendees={this.state.attendees}
                turnNumber={this.state.turnNumber}
                turnStatus={this.state.turnStatus}
                turnResult={this.state.turnResult}
            />
            : null 
          }
        </div>
        <Footer/>
      </div>
    );
  }

  componentDidMount() {
    this.intervalId = setInterval(() => this.loadData(), 600);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  loadData() {
    if (this.state.username && this.state.room) {
      this.setState({ timerCount: this.state.timerCount + 1, });
      this.fetchBackend("get", this.state.username, this.state.room, null);
      this.setState({ timerCount: this.state.timerCount - 1, });
    }
  }

  encodeBody = (data) => {
    var ret = [];
    for (var key in data) {
      let encodedKey = encodeURIComponent(key);
      let encodedVal = encodeURIComponent(data[key]);
      ret.push(encodedKey + "=" + encodedVal);
    }
    return ret.join("&");
  }

  fetchBackend = (method, username, room, requestBody) => {

    let url = "/api/rooms/"+encodeURIComponent(room)+"/user/"+encodeURIComponent(username);

    fetch(url, { mode: 'no-cors', 
                 method : method,
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                 body: requestBody != null ? this.encodeBody(requestBody) : null,
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error - 404 Not Found')
      }
      return response.json()
    })
    .then(data => { 
      console.log(JSON.stringify(data)); 
      if (data.msg) { this.setState({msg: [ ...this.state.msg, data.msg]})}
      if (data.state) { this.setState(data.state)} 
    })
    .catch(err => { let errStr = err.toString();
                    console.error("Erreur : ", errStr);
                    if (! this.state.msg.includes(errStr)) {
                      let newMsg = [ ...this.state.msg, errStr ]; 
                      this.setState({msg: newMsg}); 
                    }
                  });
  }


  /// Callback when the user logs in 
  /// Action can be : 
  /// - createRoom : to create a new room
  /// - existingRoom : to join an existing room
  handleLogin = (action, username, room, password, isOwner, cardset) => {

    this.setState({msg: []});

    let otherParams;
    let method; 

    switch(action) {

      case 'createRoom': 
        method = "post";
        otherParams = { action: 'CreateRoom',
                        actionParam: cardset + ' ' + (password ? password : ''), 
                      };
      break;

      case 'joinRoom':
        method = "post";
        otherParams = { action: 'JoinRoom',
                        actionParam: (isOwner ? password : null), 
                      };
        break;

      default:
        console.warn("Unexpected action", action);
        return;
    }

    this.fetchBackend(method, username, room, otherParams);
  }

  /// Callback when the room owner does an action
  /// Action may be 
  /// * 'EndTurn' : ends the turn and show the votes
  /// * 'NewTurn' : launch a new vote turn
  /// * 'NewVote' : launch a new vote turn
  /// When Action is 'Next', the voteName should be populated
  handleOwnerAction(action, voteName) {
    //    alert('Action: ' + action + ", next:" + voteName);
    let otherParams;
    let method; 

    this.setState({msg: []});

    switch (action) {
      case 'EndTurn':
        method = "post";
        otherParams = { action: 'EndTurn',
                      };
        break;
      case 'NewTurn':
        method = "post";
        otherParams = { action: 'NewTurn',
                      };
        break;
      case 'NewVote':
        method = "post";
        otherParams = { action: 'NewVote',
                        actionParam: voteName, 
                      };
        break;
      default:
        break;
    }
    this.fetchBackend(method, this.state.username, this.state.room, otherParams);
  }

  /// Callback when the user selects a card
  handleVoteForACard(selected) {
    this.setState({ 
      userVote : selected,
      msg: [],
    });

    let method = "post";
    let otherParams = { action: 'Vote',
                    actionParam: selected, 
                  };
    this.fetchBackend(method, this.state.username, this.state.room, otherParams);
  }

  handleExitRoom() {
    this.setState({
      room: null,
    });
  }
}

export default Poker;