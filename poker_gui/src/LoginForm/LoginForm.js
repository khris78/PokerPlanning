import React from 'react';
import './LoginForm.css'

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: null,
      username: '',
      room: '',
      password: '',
      isOwner: false,
      cardsets: null,
      cardset: "Classical",
      withZero: true,
      withCoffee: true,
    }

    fetch("/api/cardsets")
    .then((data) => data.json())
    .then((data) => {
      console.log("Retrieved " + JSON.stringify(data));
      this.setState({ cardsets: data});
    })
    .catch((err) => { 
      console.log("Erreur", err); 
      this.setState({cardsets: null}); 
    });
  }

  render() {
    return (
      <div className={"pkr_login"}>
        <h2>Bienvenue</h2>
        <h4>Dites-moi tout : </h4>
        <div className="radio">
          <label>
            <input type="radio" 
                   name="selectedOption"
                   value="joinRoom" 
                   checked={this.state.selectedOption === 'joinRoom'} 
                   onChange={(e) => this.handleInputChange(e)}
            />
            Je souhaite me connecter à une salle existante
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" 
                   name="selectedOption"
                   value="createRoom" 
                   checked={this.state.selectedOption === 'createRoom'} 
                   onChange={(e) => this.handleInputChange(e)}
            />
            Je souhaite créer une nouvelle salle
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" 
                   name="selectedOption"
                   value="junkJoke"
                   checked={this.state.selectedOption === 'junkJoke'} 
                   onChange={(e) => this.handleInputChange(e)}
            />
            Tout
          </label>
        </div>
        {(this.state.selectedOption === 'joinRoom' || this.state.selectedOption === 'createRoom') ?
          <div>
            {this.state.selectedOption === 'joinRoom' ? <h3>Parfait !</h3> : <h3>A la bonne heure !</h3>}

            {this.state.username ? <span>Votre nom : </span>
            : <><span>Mais je vois que nous n'avons pas encore été présentés...</span>
            <br/>
            <span>Quel est votre nom ? &nbsp;</span>
            </>
            }
            <br/>
            <input type="text" 
                   value={this.state.username} 
                   name="username"
                   onChange={(event) => this.handleInputChange(event)}
                   placeholder="ou votre pseudo"
                   />
            <br/>

            Le nom de la salle : 
            <br/>
            <input type="text" 
                   name="room"
                   value={this.state.room} 
                   onChange={(event) => this.handleInputChange(event)}
                   />

            {this.state.selectedOption === 'createRoom' ? 
              <>
              <br/>
              Le jeu de cartes à utiliser : 
              <br/>
              {this.state.cardsets ?
                <>
                <select name="cardset" 
                        value={this.state.cardset}
                        onChange={(event) => this.handleInputChange(event)}>
                  {Object.keys(this.state.cardsets).map(key => <option key={key} value={key}>{key}</option>)}
                </select> 
                <br/>
                { this.state.cardset && this.state.cardsets[this.state.cardset].accept_zero ?
                  <div className="radio" >
                    <label>
                    <input type="checkbox" 
                          name="withZero"
                          checked={this.state.withZero} 
                          onChange={(e) => this.handleInputChange(e)}
                    />
                    Avec la carte 0 (zéro)
                    </label>
                  </div>
                  :null
                }
                { this.state.cardset && this.state.cardsets[this.state.cardset].accept_coffee ?
                  <div className="radio">
                    <label>
                    <input type="checkbox" 
                          name="withCoffee"
                          checked={this.state.withCoffee} 
                          onChange={(e) => this.handleInputChange(e)}
                    />
                    Avec la carte <i>Café</i>
                    </label>
                  </div>
                  : null
                }
                </>
              : <span>Impossible de récupérer la liste des jeux de cartes</span>
              }
              
              <br/>Comme il faut protéger la salle, indiquez ici son mot de passe. 
              <br/>Notez que ce mot de passe est associé à la salle, et non à vous. 
              <br/><b>Attention, j'affiche ce mot de passe et je le stocke en clair.</b>
              </>
              :         
              <div className="radio">
                <label>
                <input type="checkbox" 
                       name="isOwner"
                       checked={this.state.isOwner} 
                       onChange={(e) => this.handleInputChange(e)}
                />
                Je suis le propriétaire de la salle
                </label>
              </div>
            }

            {this.state.selectedOption === 'createRoom' || this.state.isOwner ?  
              <> 
              <br/>Mot de passe de la salle : 
              <br/>
              <input type="text" 
                   name="password"
                   value={this.state.password} 
                   onChange={(event) => this.handleInputChange(event)}
                   />
              </>
              : null
            }
            <br/>
            <button onClick={() => this.props.onLogin(this.state.selectedOption, 
                                                      this.state.username, 
                                                      this.state.room, 
                                                      this.state.password, 
                                                      this.state.isOwner,
                                                      this.state.cardset + ((this.state.cardsets && this.state.cardsets[this.state.cardset].accept_zero && this.state.withZero) ? '_with_zero' : '')
                                                                         + ((this.state.cardsets && this.state.cardsets[this.state.cardset].accept_coffee && this.state.withCoffee) ? '_with_coffee' : ''))}
                    disabled={!this.state.username 
                              || ! this.state.room
                              || ((this.state.selectedOption === 'createRoom' || this.state.isOwner) && ! this.state.password) }>
              Allons-y !
            </button>

          </div>
          : null
        }
        {this.state.selectedOption === 'junkJoke' ?
          <div>
            <h3>Ah ah ah ! Très drole !</h3>
            On s'amuse comme des petits fous, n'est ce pas ?
          </div>
          : null
        }
      </div> 
    );
  }

  handleInputChange(event) {
    const target = event.target;
    const value = (target.type === 'checkbox' ? target.checked : target.value);
    const name = target.name;
    this.setState({
      [name]: value    
    });
  }
}

export default LoginForm;