import React, { Component } from "react";

import fire from "./fire";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { usuario: {} }; // <- set up react state
  }

  componentWillMount() {
    this.query("usuario");
  }

  query = refQuery => {
    const ref = fire.database().ref(refQuery);
    ref.on(
      "value",
      snapshot => {
        this.setState({ [refQuery]: snapshot.val() });
      },
      errorObject => {
        console.log("The read failed: " + errorObject.code);
      },
    );
  };

  render() {
    const { usuario } = this.state;
    console.log("ENTITY usuario", usuario);
    console.log("Object.keys(usuario).length", Object.keys(usuario).length);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Hackatour - Reto iTexico - Reto Boosh</h1>
        </header>
        <div>
          {Object.keys(usuario).length !== 0 && <span>Habemus usuario</span>}
        </div>
      </div>
    );
  }
}

export default App;
