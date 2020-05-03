const util = require('util');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const config = require('./config');

const Room = require('./db/RoomSchema');
const Event = require('./db/EventSchema');
const Attendee = require('./db/AttendeeSchema');

const { db: { host, port, name, user, pass } } = config;
const connectionString = `mongodb://${host}:${port}/${name}`;
mongoose.connect(connectionString, {useNewUrlParser: true, user: `${user}`, pass: `${pass}`});

const app = express(); // création de l'objet représentant notre application express


const cardSets = {
  "Classical" : {
    cards: [ "\u00BD", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?" ],
    accept_zero: true,
    accept_coffee : true,
  }, 
  "Fibonacci" : {
    cards: [ "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "144", "?" ],
    accept_zero: true,
    accept_coffee : true,
  },
  "T-shirt" : {
    cards: [ "XS", "S", "M", "L", "XL", "XXL" ],
    accept_zero: false,
    accept_coffee : true,
  },
};


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


// parse application/json
app.use(bodyParser.json())

app.get('/api/cardsets' , async (req, res) => {

  res.json(cardSets);
  return;
});


//app.get('/', function(req, res) { // création de la route sous le verbe get
//    res.send('Hello world  ! ') // envoi de hello world a l'utilisateur
//})

// Return the state of a room from a user point of view
var getRoomForUser = async function(username, roomname) {
  let ret = { state: {
                username: username,
                room: roomname,
                isRoomOwner: false,
                voteName: null,
                attendees: [],
                turnNumber: null,
                turnStatus: null,
                turnResult: null,
                cards : null,
              }
            };
  
  // Retrieve the room description
  let room;
  let roomevents;
  let attendees;
  try {
    let arr = await Promise.all([ Room.findOne({ room_name : roomname }).exec(), 
                                  Event.find({ room : roomname }).exec(),
                                  Attendee.find({ room_name : roomname }).exec()
                                ]);
    room = arr[0];
    roomevents = arr[1];
    attendees = arr[2]; 

  } catch(err) {
    return { msg: "Erreur lors de la lecture de la salle" + roomname + " : " + err };
  }

  if (! room) {
    return { msg: "La salle " + roomname + " n'existe plus" };
  }

  ret.state.isRoomOwner = (room.room_owner === username);

  let cardset = Object.keys(cardSets).filter(name => room.card_set.startsWith(name));
  cardset = (cardset && cardset.length > 0 ? cardset[0] : null);
  cardset = cardset ? cardSets[cardset] : null;
  if (cardset) {
    ret.state.cards = cardset.cards.slice();

    if (room.card_set.indexOf('with_zero') !== -1 ) {
      ret.state.cards.unshift("0");
    }
    
    if (room.card_set.indexOf('with_coffee') !== -1 ) {
      ret.state.cards.push("\u2615");
    }
  }

  
  roomevents.forEach(e => {
    switch (e.action) {
      case "JoinRoom": 
        let alreadyAttendee = ret.state.attendees.filter(att => att.name === e.user_name);
        if (alreadyAttendee.length == 0) {
          ret.state.attendees.push({name: e.user_name,
                                    hasVoted: false,
                                    vote: null,
                                  });
        }
      break;
      case "LeaveRoom":
        ret.state.attendees = 
            ret.state.attendees.filter(
                function(value){ 
                  return value.name === e.user_name;
                });
      break;
      case "Vote":
        if (e.user_name === username) {
          ret.state.userVote = e.action_param;
        }
        ret.state.attendees.filter(
          function(value){ 
            return value.name === e.user_name;
          }
        ).forEach(att => {
          att.hasVoted = true;
          att.vote = e.action_param;
        })
      break;
      case "NewVote":
        ret.state.voteName = e.action_param;
        ret.state.turnNumber = 0;
        // no break; => lets also start a new turn
      case "NewTurn":
        ret.state.turnNumber++;
        ret.state.turnStatus = 'ongoing';
        ret.state.turnResult = null;
        ret.state.userVote = null;
        ret.state.attendees.forEach(att => {
          att.hasVoted = false;
          att.vote = null;
        });
      break;
      case "EndTurn":
        ret.state.turnStatus = 'ended';
      break;
      case "FreezeTurn":
        ret.state.turnStatus = 'frozen';
      break;
      case "TransferRoom":
      break;
    }
  });

  // if the turn is still on-going, we hide the actual vote
  if (ret.state.turnStatus === 'ongoing') {
    ret.state.attendees.forEach(att => {
      att.vote = null;
    });
  }

  return ret;
}

// Room creation
app.get('/api/rooms/:roomname/user/:username', async (req, res) => {
  // Read params from URI
  const roomname = req.params.roomname; 
  const username = req.params.username; 
  
  ret = await getRoomForUser(username, roomname);

  res.json(ret);
  return;
});

// Room creation
app.post('/api/rooms/:roomname/user/:username', async (req, res) => {

  // Read params from URI
  const roomname = req.params.roomname; 
  const username = req.params.username; 
  
  // Other parameters from body
  const action = req.body.action;  
  const actionParam = req.body.actionParam;

  console.log('action ', action, '(', actionParam, ') room:', roomname, ', user:', username);

  let eventDate = new Date();

  let ret = null;

  switch(action) {
    case 'CreateRoom' :
      let params = actionParam.split(' '); 
      let cardSet = params[0];
      const roomPassword = params[1];

      console.log("cardset : " + cardSet + ", room password: " + roomPassword);

      const targetRoom = await Room.findOne({ room_name : roomname });
      
      if (targetRoom) {
        // The room already exists
        ret = { msg: "La salle " + roomname + " existe déjà." };
      
      } else {
        // Let's create the room
        if (!cardSet) {
          cardSet='classical_with_zero_with_coffee';
        }
    
        let room = new Room({room_name: roomname, 
                             room_owner: username,
                             card_set: cardSet, 
                             room_password: roomPassword,
                             is_active: true,
                            });
    
        await room.save();
    
        let event = new Event({room: roomname,
                               user_name: username,
                               action: 'JoinRoom',
                               created_at: eventDate,
                              });
        await event.save();
                        
        let attendee = new Attendee({user_name: username,
                                     room : roomname,
                                     last_contact: eventDate,
                                    });
        await attendee.save();
      }
    break;

    case 'JoinRoom':
      let arr = await Promise.all([ Attendee.find({room : roomname }).exec(),
                                    Room.findOne({room_name: roomname }).exec()
                                  ]);
      let attendees = arr[0];
      let room = arr[1];

      console.log('room', JSON.stringify(room));
      console.log('attendees', JSON.stringify(attendees));

      let alreadyAttendee = attendees.filter(att => att.user_name === username);
      if (alreadyAttendee.length != 0 && eventDate.getTime() - attendees[0].last_contact.getTime() < 10000) {
        ret = { msg: "Il y a déjà une personne avec ce nom/pseudo dans la salle" };
      } else if (! room) {
        ret = { msg: "La salle n'existe pas" + (actionParam ? " ou le mot de passe ne correspond pas" : "") };
      
      } else {

        // TODO : gérer le cas où le mot de passe est saisi, et le cas où il n'est pas saisi mais que l'utilisateur est le propriétaire
        console.log("Found room ", room);
        console.log("Found attendees ", attendees);

        let curAttendee;
        if (alreadyAttendee.length != 0) {
          curAttendee = alreadyAttendee[0];
        } else {
          curAttendee = new Attendee({name : username,
                                      room: roomname,
                                      last_contact: eventDate
                                     });
        }

        let event = new Event({room: roomname,
          user_name: username,
          action: 'JoinRoom',
          created_at: eventDate,
        });

        arr = await Promise.all([ event.save(),
                                  curAttendee.save()
                                ]);

        await event.save(function (err) {
          if (err) return handleError(err, "Erreur lors de l'ajout de l'événement de création de la salle");
        });
      }
      break;
    
    case "NewVote":
    case "NewTurn":
    case "EndTurn":
    case "FreezeTurn":
      let roomOfVote = await Room.findOne({room_name: roomname }).exec();

      if (username !== roomOfVote.room_owner) {
        ret = { msg: "Seul le prorpiétaire peut faire l'action " + action};
      } else {
        if (actionParam === null) {
          actionParam = undefined;
        }
        let event = new Event({room: roomname,
          user_name: username,
          action: action,
          action_param : actionParam,
          created_at: eventDate,
        });

        await event.save();
      }
      break;

    case "Vote": 
      // TODO : vérifier le statut du tour
      let event = new Event({room: roomname,
        user_name: username,
        action: action,
        action_param : actionParam,
        created_at: eventDate,
      });
      await event.save();
      break;
  }

  // Return the room
  if (ret == null) {
    ret = await getRoomForUser(username, roomname);
  }
 
  res.json(ret);
  return;
});

app.listen(config.app.port, () =>  { // ecoute du serveur sur le port 8080
    console.log('le serveur fonctionne')
})