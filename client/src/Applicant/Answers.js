import React from 'react';
import PropTypes from 'prop-types';
import styles from './ApplicantStyles';
import FetchData from '../common/FetchData';

const propTypes = {
  onReadyStatus: PropTypes.func,
  readonly: PropTypes.bool,
  targetId: PropTypes.number,
  answers: PropTypes.object,
  questions: PropTypes.object,
  onSaved: PropTypes.func,
};

const defaultProps = {
  answers: {},
};

export default class Answers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dirtyAnswers: false,
      answers: props.answers,
    };
  }

  componentDidMount() {
    this.checkAllQuestionsAnswered();
  }

  checkAllQuestionsAnswered = () => {
    if (!this.props.onReadyStatus) {
      return;
    }
    const { answers, dirtyAnswers } = this.state;
    if (Object.keys(answers).length === 0 || dirtyAnswers) {
      return this.props.onReadyStatus(false);
    }
    this.props.onReadyStatus(
      Object.values(answers).filter(q => q.length === 0).length === 0
    );
  };

  stateToParams = () => {
    return {
      answers: Object.entries(this.state.answers).map(
        ([question_id, text]) => ({ question_id, text })
      ),
    };
  };

  doPut = (scope, params) => new FetchData(scope).put(params);

  handleSaveAnswers = () => {
    const fetcher = this.props.fetcher || this.doPut;
    fetcher({ scope: 'answers' }, this.stateToParams()).then(() => {
      this.setState({ dirtyAnswers: false }, this.checkAllQuestionsAnswered);
      this.props.onSaved && this.props.onSaved();
      window.alert('Saved');
    });
  };

  handleCancelAnswers = () => {
      this.setState({ dirtyAnswers: false, answers: this.props.answers }, this.checkAllQuestionsAnswered);
      this.props.onSetDirty(false);
  };

  handleAnswerChanged = e => {
    if (this.props.readOnly) {
      return;
    }
    const { id, value } = e.target;
    this.setState(
      {
        dirtyAnswers: true,
        answers: {
          ...this.state.answers,
          [id]: value,
        },
      },
      this.checkAllQuestionsAnswered
    );
    this.props.onSetDirty(true);
  };

  render() {
    const { questions } = this.props;
    return (
      <React.Fragment>
        <h2 style={styles.heading}>Recruitment Questions</h2>
        {this.state.dirtyAnswers && !this.props.readonly && (
          <div style={{ display: 'table', margin: '0 auto', width: '150px' }}>
            <div style={{ display: 'table-row' }}>
              <div style={{ display: 'table-cell' }}>
                <button
                  style={styles.secondaryButton}
                  onClick={this.handleCancelAnswers}
                >
                  Cancel
                </button>
              </div>
              <div style={{ display: 'table-cell' }}>
                <button
                  style={styles.primaryButton}
                  onClick={this.handleSaveAnswers}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {Object.keys(questions || {}).map(key => {
          const question = questions[key];
          const answer = this.state.answers[key];
          console.log(question, answer);
          
          return (
            <div key={key}>
              <div style={styles.padded}>{question}</div>
              {this.props.readonly ? (
                <div style={styles.answerText} id={key}>
                  {answer.split('\n').map(line => (
                    <div>{line}</div>
                  ))}
                </div>
              ) : (
                <textarea
                  style={styles.answer}
                  id={key}
                  readOnly={this.props.readOnly}
                  onChange={this.handleAnswerChanged}
                  value={answer}
                />
              )}
              <hr style={styles.hr} />
            </div>
          );
        })}
      </React.Fragment>
    );
  }
}

Answers.propTypes = propTypes;
Answers.defaultProps = defaultProps;
