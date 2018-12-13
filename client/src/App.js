import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Evidence from './Evidence';

class App extends Component {
  handleCick(id) {
    console.log('hello' + id)
  }

  render() {
    return (
      <Router basename="testfiles">
        <div className="App">
          <Evidence>
          </Evidence>
        </div >
      </Router>
    );
  }
}

export default App;
