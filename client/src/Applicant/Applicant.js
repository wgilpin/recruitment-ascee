import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Alts from '../Alts';
import FetchData from '../common/FetchData';
import styles from './ApplicantStyles';
import AsceeImg from '../images/ascee_logo.png';
import FabButton from '../common/fabButton';

export default class Applicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      altsDone: false,
      ready: false,
      has_application: false,
      submitted: false,
    };
    this.answers = {};
  }

  applicationStatus() {
    return <div style={{ ...styles.padded, ...styles.heading }}>
      {this.state.has_application ? 'Application not completed' : 'Application not started'}
    </div>
  }

  questionsToState = ({ questions, has_application }) => {
    this.setState({ questions, has_application });
    Object.keys(questions).forEach(key => {
      this.answers[key] = questions[key].answer;
    });
  };

  componentDidMount() {
    let fetch = new FetchData({ scope: 'answers' });
    fetch.get().then(this.questionsToState);
  }

  handleAnswerChanged = e => {
    this.answers[e.target.id] = e.target.value;
    this.checkReady();
  };

  allQuestionsAnswered = () => {
    if (this.answers === undefined) {
      return false;
    }
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

  submit = () => {
    if (this.state.has_application) {
      const qa = [];
      Object.keys(this.state.questions).forEach(key => {
        const q = this.state.questions[key];
        qa.push({ q: q.q, a: this.answers[key], id: key });
      });
      new FetchData({ scope: 'recruits/submit_application' })
        .put(qa)
        .then((res) => {
          if (res.status === 401) {
            return window.location = '/app';
          }
          if (res.status > 401) {
            return alert('Error submitting\n' + res.statusText);
          }
          this.setState({ submitted: true });
        })
        .catch(() => alert('Error submitting'));
    } else {
      // no application, start one
      new FetchData({ scope: 'recruits/start_application' })
        .get()
        .then((res) => {
          if (res.status === 401) {
            return window.location = '/app';
          }
          window.location.reload()
        })
        .catch(() => alert('Error creating application'));
    }
  };

  buildQuestionsPanel = () => {
    return (
      <TabPanel>
        <h2 style={styles.heading}>Recruitment Questions</h2>
        {Object.keys(this.state.questions || {}).map(key => {
          const { question } = this.state.questions[key];
          const answer = this.answers[key];
          return (
            <div key={key}>
              <div style={styles.padded}>{question}</div>
              <textarea style={styles.answer} id={key} onChange={this.handleAnswerChanged}>
                {answer}
              </textarea>
              <hr style={styles.hr} />
            </div>
          );
        })}
      </TabPanel>
    );
  };

  buildHeader = () => {
    const buttonLabel = this.state.has_application ? 'Submit' : 'Start';
    return (
      < >
        <div style={styles.header}>
          <h1 style={styles.h1}>
            <img src={AsceeImg} style={styles.logo} alt="Ascendance" />
            Applying to Ascendance
          </h1>
        </div>
        {this.state.has_application &&
          <div style={styles.paddedHeavily}>
            Start with your alts, add them all. Once that's done, move on to the
            questions.
          </div>
        }
        <div >
          {(this.state.ready || !this.state.has_application) &&
            <button style={{ ...styles.submit, ...styles.padded }} onClick={this.submit}>
              {buttonLabel} Application
            </button>
          }
          {!this.state.ready && this.applicationStatus()}
        </div>
      </>
    );
  };

  buildAltsPanel = () => {
    return (
      <TabPanel>
        <h2 style={styles.headingLeft}>My Alts</h2>
        <div style={styles.padded}>
          <label style={styles.label}>
            I have no more alts&emsp;
            <input style={styles.checkbox}
              type="checkbox"
              onClick={this.handleAltsDone}
              checked={this.state.altsDone}
            />
          </label>
        </div>
        <Alts style={styles.alts}>
          <a href="/auth/link_alt">
            {!this.state.ready && <FabButton icon="add" color="#c00" size="40px" />}
          </a>
        </Alts>
      </TabPanel>
    );
  };

  render() {
    if (!this.state.has_application) {
      return this.buildHeader();
    }
    return [
      !this.state.submitted && <React.Fragment >
        <div style={styles.logout}><a href="/auth/logout">Sign out</a></div>
        {this.buildHeader()}
        <Tabs>
          <TabList>
            <Tab>Alts</Tab>
            <Tab>Questions</Tab>
          </TabList>
          {this.buildAltsPanel()}
          {this.buildQuestionsPanel()}
        </Tabs>
      </React.Fragment>,
      this.state.submitted && <h1>Application Submitted</h1>
    ];
  }
}
