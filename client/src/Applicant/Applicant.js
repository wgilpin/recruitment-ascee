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
import Screenshots from './../evidence/Screenshots';

export default class Applicant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      altsDone: false,
      altsImages: false,
      ready: false,
      has_application: false,
      answersReady: false,
      submitted: false,
      pictures: [],
      questions: [],
      applicationStatus: '',
      dirtyAnswers: false,
      screenshotsCount: 0,
      altsCount: 0,
    };
  }

  questionsToState = questions => {
    this.setState({ questions: questions || {} });
  };

  answersToState = ({ has_application, questions }) => {
    console.log('got answers');
    const newAnswers = { ...this.state.answers };
    let answersReady = true;
    Object.keys(questions || []).forEach(key => {
      newAnswers[key] = questions[key].answer;
      answersReady = newAnswers[key].length === 0 ? false : answersReady;
    });
    this.setState({
      answers: newAnswers,
      has_application,
      answersReady,
      dirtyAnswers: false,
    });
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
          applicationStatus: (info || {}).current_application_status,
          altsDone: (info || {}).current_application_status === 'submitted',
        });
      })
      .catch(e => console.log(e));
  };

  componentDidMount() {
    this.loadAnswers();
    this.loadQuestions();
    this.loadCharacterSummary();
  }

  checkReady = () => {
    const { altsDone, answersReady, imagesDone, altsCount, screenshotsCount } = this.state;
    this.setState({
      ready:
        altsDone && answersReady && imagesDone && (screenshotsCount*3) >= altsCount,
    });
  };

  handleAnswersDirty = isDirty => this.setState({ dirtyAnswers: isDirty });

  getNotReadyErrorMessage = () => {
    const{ altsDone, screenshotsCount, altsCount } = this.state;

    const altsMsg = altsDone
      ? ''
      : 'Add all your alts, then tick "I have no more alts". ';
    const questionsMsg = this.allQuestionsAnswered()
      ? ''
      : 'Answer all the questions. ';
    const screenshotMsg = (screenshotsCount*3) >= altsCount
      ? ''
      : "You haven't added enough login screenshots for your alts. "
    return altsMsg + questionsMsg + screenshotMsg;
  };

  handleAltsDone = cb => {
    this.setState({ altsDone: cb.target.checked }, this.checkReady);
  };

  handleImagesDone = cb => {
    this.setState({ imagesDone: cb.target.checked }, this.checkReady);
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

  handleSelectTab = () => {
    if (this.state.dirtyAnswers) {
      alert('Please Save or Cancel your answers');
    }
    return !this.state.dirtyAnswers;
  };

  handleChangeScreenshots = screenshotsCount =>
    this.setState({ screenshotsCount }, this.checkReady);

  handleAltsCount = altsCount =>
    this.setState({ altsCount }, this.checkReady);

  render() {
    const {
      altsDone,
      imagesDone,
      ready,
      answers,
      questions,
      has_application,
      applicationStatus,
    } = this.state;
    if (!this.state.has_application) {
      return (
        <ApplicantProvider
          value={{
            altsDone,
            ready,
            status: applicationStatus || '',
            has_application: false,
          }}
        >
          <ApplicantHeader onSubmit={this.submit} />
        </ApplicantProvider>
      );
    }
    return [
      !this.state.submitted && (
        <React.Fragment>
          <div style={styles.logout}>
            <a href="/auth/logout">
              <button style={styles.secondaryButton}>Sign Out</button>
            </a>
          </div>
          <ApplicantProvider
            value={{
              altsDone,
              ready,
              has_application,
              status: applicationStatus || '',
            }}
          >
            <ApplicantHeader onSubmit={this.submit} />
            <Tabs onSelect={this.handleSelectTab}>
              <TabList>
                <Tab> Alts </Tab>
                <Tab> Questions </Tab>
                <Tab>Screenshots</Tab>
              </TabList>
              <TabPanel style={styles.panel}>
                <AltsPanel onAltsDone={this.handleAltsDone} onChangeCount={this.handleAltsCount} />
              </TabPanel>
              <TabPanel style={styles.panel}>
                <Answers
                  answers={answers}
                  questions={questions}
                  onReadyStatus={this.setAnswersStatus}
                  onSaved={this.loadAnswers}
                  readOnly={applicationStatus === 'submitted'}
                  onSetDirty={this.handleAnswersDirty}
                />
              </TabPanel>
              <TabPanel>
                <ImagesUpload
                  canDelete={applicationStatus !== 'submitted'}
                  imagesDone={imagesDone}
                  onImagesDone={this.handleImagesDone}
                  onChange={this.handleChangeScreenshots}
                />
              </TabPanel>
            </Tabs>
          </ApplicantProvider>
        </React.Fragment>
      ),
      this.state.submitted && <h1>Application Submitted</h1>,
    ];
  }
}
