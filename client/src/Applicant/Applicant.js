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
      dirtyAnswers: false,
      answers: {},
    };
  }

  applicationStatus() {
    return (
      <div style={{ ...styles.padded, ...styles.heading }}>
        {this.state.has_application
          ? 'Application not completed'
          : 'Application not started'}
      </div>
    );
  }

  questionsToState = (questions) => {
    this.setState({ questions });
  };

  answersToState = ({ has_application, questions }) => {
    console.log('got answers');
    const newAnswers = { ...this.state.answers };
    Object.keys(questions).forEach(key => {
      newAnswers[key] = questions[key].answer;
    });
    this.setState({ answers: newAnswers, has_application: true });
  };

  componentDidMount() {
    new FetchData({ scope: 'questions' })
      .get()
      .then(this.questionsToState);
    new FetchData({ scope: 'answers' })
      .get()
      .then(this.answersToState);
  }

  handleAnswerChanged = e => {
    this.setState({
      dirtyAnswers: true,
      answers: {
        ...this.state.answers,
        [e.target.id]: e.target.value,
      },
    },
    () => this.checkReady());
  };

  allQuestionsAnswered = () => {
    if (Object.keys(this.state.answers).length === 0) {
      return false;
    }
    return Object.values(this.state.answers)
      .filter(q => q.length === 0).length === 0;
  };

  checkReady = () => {
    this.setState({
      ready: this.state.altsDone && this.allQuestionsAnswered(),
    });
  };

  getNotReadyErrorMessage = () => {
    const altsMsg = this.state.altsDone ? '' : 'Add all your alts, then tick "I have no more alts".';
    const questionsMsg = this.allQuestionsAnswered() ? '' : 'Answer all the questions';
    return altsMsg + questionsMsg;
  };

  handleAltsDone = cb => {
    this.setState({ altsDone: cb.target.checked }, this.checkReady);
  };

  stateToParams = () => {
    return {
      answers: Object.entries(this.state.answers).map(
        ([question_id, text]) => ({ question_id, text })
      ),
    };
  };

  handleSaveAnswers = () => {
    new FetchData({ scope: 'answers' }).put(this.stateToParams()).then(() => {
      this.setState({ dirtyAnswers: false });
      window.alert('Saved');
    });
  };

  submit = () => {
    if (this.state.has_application && !this.state.ready) {
      return alert(this.getNotReadyErrorMessage());
    }
    if (!this.state.has_application) {
      // no application, start one
      return new FetchData({ scope: 'recruits/start_application' })
        .get()
        .then(res => {
          if (res.status === 401) {
            return (window.location = '/app/');
          }
          window.location.reload();
        })
        .catch(() => alert('Error creating application'));
    }
    if (this.state.ready || this.state.has_application) {
      new FetchData({ scope: 'answers' })
        .put(this.stateToParams())
        .then(() => {
          new FetchData({ scope: 'recruits/submit_application' })
            .put()
            .then(res => {
              if (res.status === 401) {
                return (window.location = '/app/');
              }
              if (res.status > 401) {
                return alert('Error submitting\n' + res.statusText);
              }
              this.setState({ submitted: true });
            });
        })
        .catch(e => {
          console.log(e.message);
          alert('Error submitting');
        });
    }
  };

  buildQuestionsPanel = () => {
    return (
      <TabPanel>
        <h2 style={styles.heading}>Recruitment Questions</h2>
        {Object.keys(this.state.questions || {}).map(key => {
          const question = this.state.questions[key];
          const answer = this.state.answers[key];
          return (
            <div key={key}>
              <div style={styles.padded}>{question}</div>
              <textarea
                style={styles.answer}
                id={key}
                onChange={this.handleAnswerChanged}
              >
                {answer}
              </textarea>
              <hr style={styles.hr} />
            </div>
          );
        })}
        {this.state.dirtyAnswers && (
          <button style={styles.primaryButton} onClick={this.handleSaveAnswers}>
            Save
          </button>
        )}
      </TabPanel>
    );
  };

  buildHeader = () => {
    let buttonLabel = 'Start';
    let buttonStyle;
    if (this.state.has_application) {
      buttonLabel = 'Submit';
    }
    if (this.state.has_application && this.state.ready) {
      buttonStyle = { ...styles.submit, ...styles.padded };
    } else {
      buttonStyle = { ...styles.disabledButton, ...styles.padded };
    }

    return (
      <>
        <div style={styles.header}>
          <h1 style={styles.h1}>
            <img src={AsceeImg} style={styles.logo} alt="Ascendance" />
            Applying to Ascendance
          </h1>
        </div>
        {this.state.has_application && (
          <div style={styles.paddedHeavily}>
            Start with your alts, add them all. Once that's done, move on to the
            questions.
          </div>
        )}
        <div>
          <button style={buttonStyle} onClick={this.submit}>
            {buttonLabel} Application
          </button>
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
            <input
              style={styles.checkbox}
              type="checkbox"
              onClick={this.handleAltsDone}
              checked={this.state.altsDone}
            />
          </label>
        </div>
        <Alts style={styles.alts}>
          <a href="/auth/link_alt">
            {!this.state.ready && (
              <FabButton icon="add" color="#c00" size="40px" />
            )}
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
      !this.state.submitted && (
        <React.Fragment>
          <div style={styles.logout}>
            <a href="/auth/logout">Sign out</a>
          </div>
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
      ),
      this.state.submitted && <h1>Application Submitted</h1>,
    ];
  }
}
