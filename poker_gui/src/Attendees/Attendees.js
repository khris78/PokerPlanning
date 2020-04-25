import React from 'react';
import './Attendees.css'

function Attendees(props) {
  return (
    <div className={"pkr_attendees"}>
      <h4>Participants</h4>
      <ul>
      {
        props.attendees.map(
          (attendee) =>
            <li key={attendee.name}>
              <span className={attendee.hasVoted ? "pkr_hasVoted" : "pkr_hasNotVoted"}>
                {attendee.vote ? attendee.vote + " - " : ""}{attendee.name}
              </span>
            </li>
        )
      }
      </ul>
    </div> 
  );
}

export default Attendees;