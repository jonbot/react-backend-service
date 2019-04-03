import React, { Component } from "react";
import { connect } from "react-redux";
import Backend from "./backend";
import Home from "./containers/Home";

class App extends Component {
  render() {
    return (
      <Backend>
        <Home />
      </Backend>
    );
  }
}

export default App;
