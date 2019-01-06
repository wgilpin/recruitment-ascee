import React, { Component, setGlobal } from 'reactn';
import { BrowserRouter as Router } from 'react-router-dom';
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
    return (
      <Router basename="testfiles">
        <div className="App">
          <MainMenu>
          </MainMenu>
        </div >
      </Router>
    );
  }
}

export default App;
