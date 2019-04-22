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

  componentDidMount() {
    new FetchData({ scope: 'questions' }).get().then(this.questionsToState);
    new FetchData({ scope: 'answers' }).get().then(this.answersToState);
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
      new FetchData({ scope: 'answers' })
        .put(this.stateToParams())
        .then(() => {
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
            });
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

  setAnswersStatus = ready => this.setState({ answersReady: ready }, this.checkReady)

  render() {
    const { altsDone, ready, answers, questions, has_application } = this.state;
    if (!this.state.has_application) {
      return (
        <ApplicantProvider value={{ altsDone, ready }}>
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
          <ApplicantProvider value={{ altsDone, ready, has_application }}>
            <ApplicantHeader onSubmit={this.submit} />
            <Tabs>
              <TabList>
                <Tab>Alts</Tab>
                <Tab>Questions</Tab>
                <Tab>Screenshots</Tab>
              </TabList>
              <TabPanel>
                <AltsPanel onAltsDone={this.handleAltsDone} />
              </TabPanel>
              <TabPanel>
                <Answers
                  answers={answers}
                  questions={questions}
                  onReadyStatus={this.setAnswersStatus}
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
