import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Alts from './Alts';
import FetchData from './FetchData';
import TableStyles from './TableStyles';

const styles = {
  submit: {
    fontSize: 'large',
    padding: '6px',
    color: TableStyles.styles.header.color,
  },
  padded: {
    padding: 6,
  },
  tabHeader: {
    color: TableStyles.styles.header.color,
  },
  heading: {
    color: TableStyles.styles.header.color,
  },
  hr: {
    borderColor: '#555555',
    borderWidth: '1px',
  }
};

export default class Applicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      altsDone: false,
      ready: false,
    };
    this.answers = {};
  }

  applicationStatus() {
    return 'Application not completed';
  }

  questionsToState = data => {
    this.setState({ questions: data.info });
    data.info.forEach(q => {
      this.answers[q.q] = q.a;
    });
  };

  componentDidMount() {
    let fetch = new FetchData({ scope: 'questions' });
    fetch.get().then(this.questionsToState);
  }

  handleAnswerChanged = e => {
    this.answers[e.target.id] = e.target.value;
    this.checkReady();
  };

  allQuestionsAnswered = () => {
    let allDone = true;
    Object.keys(this.answers).forEach(q => {
      if (this.answers[q].length === 0) {
        allDone = false;
      }
    });
    return allDone;
  };

  checkReady = () => {
    this.setState({
      ready: this.state.altsDone && this.allQuestionsAnswered(),
    });
  };

  handleAltsDone = cb => {
    this.setState({ altsDone: cb.target.checked }, this.checkReady);
  };

  render() {
    return (
      <React.Fragment>
        <div style={styles.padded}>
          Start with your alts, add them all. Once that's done, move on to the
          questions.
        </div>
        <div style={styles.submit}>
          {this.state.ready && (
            <button style={styles.submit} onClick={this.submit}>Submit Application</button>
          )}
          {!this.state.ready && this.applicationStatus()}
        </div>
        <Tabs>
          <TabList>
            <Tab style={styles.tabHeader}>Alts</Tab>
            <Tab>Questions</Tab>
          </TabList>

          <TabPanel>
            <h2 style={styles.heading}>My Alts</h2>
            <div style={styles.padded}>
              <a href="/login/alt">
                <button style={styles.padded}>Add another alt</button>
              </a>
            </div>
            <div style={styles.padded}>
              <label>
                I have no more alts
                <input
                  type="checkbox"
                  onClick={this.handleAltsDone}
                  checked={this.state.altsDone}
                />
              </label>
            </div>
            <Alts />
          </TabPanel>
          <TabPanel>
            <h2 style={styles.heading}>Recruitment Questions</h2>
            {this.state.questions.map(q => {
              return (
                <React.Fragment>
                  <div style={styles.padded}>{q.q}</div>
                  <textarea id={q.q} onChange={this.handleAnswerChanged}>
                    {q.a}
                  </textarea>
                  <hr style={styles.hr}/>
                </React.Fragment>
              );
            })}
          </TabPanel>
        </Tabs>
      </React.Fragment>
    );
  }
}
