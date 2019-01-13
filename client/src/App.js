import React, { Component, setGlobal } from 'reactn';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import MainMenu from './MainMenu';

// Set an initial global state directly:
setGlobal({
  // user id
  id: null,
  // avatar url for current user
  avatar: null,
  // user name
  username: '',
  // list of recruits
  recruits: [],
});

class App extends Component {
  handleCick(id) {
    console.log('hello' + id)
  }

  render() {
    const showing = this.props;
    console.log(showing);
    return (
      <Router basename="app">
        <div className="App">
          <Route path="/" component={MainMenu} />
        </div >
      </Router>
    );
  }
}

export default App;
