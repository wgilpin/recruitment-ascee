import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FetchData from '../common/FetchData';
import styles from './ApplicantStyles';
import Answers from './Answers';
import ImagesUpload from './ImagesUpload';
import { ApplicantProvider } from './ApplicantContext';
import AltsPanel from './AltsPanel';
import ApplicantHeader from './ApplicantHeader';

export default class Applicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      altsDone: false,
      ready: false,
      has_application: false,
      answersReady: false,
      submitted: false,
      pictures: [],
      questions: [],
      applicationStatus: '',
    };
  }

  questionsToState = questions => {
    this.setState({ questions });
  };

  answersToState = ({ has_application, questions }) => {
    console.log('got answers');
    const newAnswers = { ...this.state.answers };
    let answersReady = true;
    Object.keys(questions).forEach(key => {
      newAnswers[key] = questions[key].answer;
      answersReady = newAnswers[key].length === 0 ? false : answersReady;
    });
    this.setState({ answers: newAnswers, has_application, answersReady });
  };

  loadAnswers = () =>
    new FetchData({ scope: 'answers' }).get().then(this.answersToState);

  loadQuestions = () =>
    new FetchData({ scope: 'questions' }).get().then(this.questionsToState);

  loadCharacterSummary = () => {

    new FetchData({ scope: 'character/summary' })
      .get()
      .then(({ info }) => {
        return this.setState({
          applicationStatus: info.current_application_status,
          altsDone: info.current_application_status === 'submitted',
        })
      })
      .catch(e => console.log(e));
  };

  componentDidMount() {
    this.loadAnswers();
    this.loadQuestions();
    this.loadCharacterSummary();
  }

  checkReady = () => {
    this.setState({
      ready: this.state.altsDone && this.state.answersReady,
    });
  };

  getNotReadyErrorMessage = () => {
    const altsMsg = this.state.altsDone
      ? ''
      : 'Add all your alts, then tick "I have no more alts".';
    const questionsMsg = this.allQuestionsAnswered()
      ? ''
      : 'Answer all the questions';
    return altsMsg + questionsMsg;
  };

  handleAltsDone = cb => {
    this.setState({ altsDone: cb.target.checked }, this.checkReady);
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
            return (window.location = '/auth/logout/');
          }
          window.location.reload();
        })
        .catch(() => alert('Error creating application'));
    }
    if (this.state.ready || this.state.has_application) {
      new FetchData({ scope: 'recruits/submit_application' })
        .put()
        .then(res => {
          if (res.status === 401) {
            return (window.location = '/auth/logout/');
          }
          if (res.status > 401) {
            return alert('Error submitting\n' + res.statusText);
          }
          this.setState({ submitted: true });
        })
        .catch(e => {
          console.log(e.message);
          alert('Error submitting');
        });
    }
  };

  onDrop = (pictureFiles, pictureDataURLs) => {
    this.setState({
      pictures: this.state.pictures.concat(pictureFiles),
    });
  };

  setAnswersStatus = ready =>
    this.setState({ answersReady: ready }, this.checkReady);

  render() {
    const { altsDone, ready, answers, questions, has_application, applicationStatus } = this.state;
    if (!this.state.has_application) {
      return (
        <ApplicantProvider value={{ altsDone, ready, status: applicationStatus }}>
          <ApplicantHeader onSubmit={this.submit} />
        </ApplicantProvider>
      );
    }
    return [
      !this.state.submitted && (
        <React.Fragment>
          <div style={styles.logout}>
            <a href="/auth/logout">Sign out</a>
          </div>
          <ApplicantProvider value={{ altsDone, ready, has_application, status: applicationStatus }}>
            <ApplicantHeader onSubmit={this.submit} />
            <Tabs>
              <TabList>
                <Tab> Alts </Tab>
                <Tab> Questions </Tab>
                <Tab>Screenshots</Tab>
              </TabList>
              <TabPanel style={styles.panel}>
                <AltsPanel onAltsDone={this.handleAltsDone} />
              </TabPanel>
              <TabPanel style={styles.panel}>
                <Answers
                  answers={answers}
                  questions={questions}
                  onReadyStatus={this.setAnswersStatus}
                  onSaved={this.loadAnswers}
                  readOnly={applicationStatus === 'submitted'}
                />
              </TabPanel>
              <TabPanel>
                <ImagesUpload />
              </TabPanel>
            </Tabs>
          </ApplicantProvider>
        </React.Fragment>
      ),
      this.state.submitted && <h1>Application Submitted</h1>,
    ];
  }
}
