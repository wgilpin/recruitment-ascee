import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Alts from './Alts';
import FetchData from './FetchData';

export default class Applicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
    };
  }

  applicationStatus() {
    return 'Application not completed';
  }

  questionsToState = data => {
    this.setState({ questions: data.info });
  };

  componentDidMount() {
    let fetch = new FetchData({ scope: 'questions' });
    fetch.get().then(this.questionsToState);
  }

  render() {
    return (
      <React.Fragment>
        <div>{this.applicationStatus()}</div>
        <div>
          Start with your alts, add them all. Once that's done, move on to the
          questions.
        </div>
        <Tabs>
          <TabList>
            <Tab>Alts</Tab>
            <Tab>Questions</Tab>
          </TabList>

          <TabPanel>
            <h2>My Alts</h2>
            <div><a href="/login/alt"><button>Add another alt</button></a></div>
            <div><label>
              I have no more alts
              <input type="checkbox" />
            </label></div>
            <Alts />
          </TabPanel>
          <TabPanel>
            <h2>Recruitment Questions</h2>
            {this.state.questions.map(q => {
              return (
                <React.Fragment>
                  <div>{q.q}</div>
                  <textarea>{q.a}</textarea>
                  <hr />
                </React.Fragment>
              );
            })}
          </TabPanel>
        </Tabs>
      </React.Fragment>
    );
  }
}
