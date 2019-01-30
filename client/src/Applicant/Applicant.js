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
    };
    this.answers = {};
  }

  applicationStatus() {
    return <div style={{ ...styles.padded, ...styles.heading }}>
      Application not completed
    </div>
  }

  questionsToState = data => {
    this.setState({ questions: data.info });
    data.info.forEach(q => {
      this.answers[q.q] = q.a;
    });
  };

  componentDidMount() {
    let fetch = new FetchData({ scope: 'api/questions' });
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
    const qa = [];
    this.state.questions.forEach(q => {
      qa.push({q: q.q, a: this.answers[q.q]});
    });
    const post = new FetchData({ scope: 'recruits/submit' });
    post
      .post(qa)
      .then((res) => {
        if (res.status === 401){
          return window.location = '/app';
        }
        alert('Submitted')})
      .catch(() => alert('Error sumbitting'));
  };

  buildQuestionsPanel = () => {
    return (
      <TabPanel>
        <h2 style={styles.heading}>Recruitment Questions</h2>
        {(this.state.questions || []).map(q => {
          return (
            <React.Fragment>
              <div style={styles.padded}>{q.q}</div>
              <textarea style={styles.answer} id={q.q} onChange={this.handleAnswerChanged}>
                {q.a}
              </textarea>
              <hr style={styles.hr} />
            </React.Fragment>
          );
        })}
      </TabPanel>
    );
  };

  buildHeader = () => {
    return (
      <React.Fragment>
        <div style={styles.header}>
          <h1 style={styles.h1}>
            <img src={AsceeImg} style={styles.logo} alt="Ascendance" />
            Applying to Ascendance
          </h1>
        </div>
        <div style={styles.paddedHeavily}>
          Start with your alts, add them all. Once that's done, move on to the
          questions.
        </div>
        <div >
          {this.state.ready && (
            <button style={{ ...styles.submit, ...styles.padded }} onClick={this.submit}>
              Submit Application
            </button>
          )}
          {!this.state.ready && this.applicationStatus()}
        </div>
      </React.Fragment>
    );
  };

  buildAltsPanel = () => {
    return (
      <TabPanel>
        <h2 style={styles.headingLeft}>My Alts</h2>
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
        <Alts style={styles.alts}>
          <a href="/auth/link_alt">
            {!this.state.ready && <FabButton icon="add" color="#c00" size="40px"/>}
          </a>
        </Alts>
      </TabPanel>
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.buildHeader()}
        <Tabs>
          <TabList>
            <Tab>Alts</Tab>
            <Tab>Questions</Tab>
          </TabList>
          {this.buildAltsPanel()}
          {this.buildQuestionsPanel()}
        </Tabs>
      </React.Fragment>
    );
  }
}
