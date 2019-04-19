import React, { Component, setGlobal } from 'reactn';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FetchData from '../common/FetchData';
import styles from './ApplicantStyles';
import Answers from './Answers';
import ImagesUpload from './ImagesUpload';
import { ApplicantProvider } from './ApplicantContext';
import AltsPanel from './AltsPanel';
import ApplicantHeader from './ApplicantHeader';

setGlobal({ questions: [], answers: {} });

export default class Applicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      altsDone: false,
      ready: false,
      has_application: false,
      submitted: false,
      pictures: [],
    };
  }

  questionsToState = questions => {
    this.setGlobal({ questions });
  };

  answersToState = ({ has_application, questions }) => {
    console.log('got answers');
    const newAnswers = { ...this.state.answers };
    Object.keys(questions).forEach(key => {
      newAnswers[key] = questions[key].answer;
    });
    this.setGlobal({ answers: newAnswers });
    this.setState({ has_application: true });
  };

  componentDidMount() {
    new FetchData({ scope: 'questions' }).get().then(this.questionsToState);
    new FetchData({ scope: 'answers' }).get().then(this.answersToState);
  }

  allQuestionsAnswered = () => {
    if (Object.keys(this.global.answers).length === 0) {
      return false;
    }
    return (
      Object.values(this.global.answers).filter(q => q.length === 0).length ===
      0
    );
  };

  checkReady = () => {
    this.setState({
      ready: this.state.altsDone && this.allQuestionsAnswered(),
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

  stateToParams = () => {
    return {
      answers: Object.entries(this.global.answers).map(
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

