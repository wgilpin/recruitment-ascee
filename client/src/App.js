import React, { Component, setGlobal } from 'reactn';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import MainMenu from './MainMenu';
import Applicant from './Applicant/Applicant';
import Recruiter from './recruiter/Recruiter';
import Admin from './admin/Admin';

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
      <Router>
        <div className="App">
          <Route path="/" exact component={MainMenu} />
          <Route path="/app/" exact component={MainMenu} />
          <Route path="/app/apply" component={Applicant} />
          <Route path="/app/recruiter" component={Recruiter} />
          <Route path="/app/admin" component={Admin} />
        </div >
      </Router>
    );
  }
}

export default App;
