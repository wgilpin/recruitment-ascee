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
    const { answers, dirtyAnswers } = this.state;
    if (Object.keys(answers).length === 0 || dirtyAnswers) {
      this.props.onReadyStatus(false);
    }
    this.props.onReadyStatus (
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
      window.alert('Saved');
    });
  };

  handleAnswerChanged = e => {
    const { id, value } = e.target;
    this.setState(
      {
        dirtyAnswers: true,
        answers: {
          ...this.state.answers,
          [id]: value,
        },
      },
      this.checkAllQuestionsAnswered,
    );
  };

  render() {
    const { questions } = this.props;
    return (
      <React.Fragment>
        <h2 style={styles.heading}>Recruitment Questions</h2>
        {Object.keys(questions || {}).map(key => {
          const question = questions[key];
          const answer = this.state.answers[key];
          return (
            <div key={key}>
              <div style={styles.padded}>{question}</div>
              {this.props.readonly ? (
                <div style={styles.answerText} id={key} >
                  {answer.split('\n').map(line => <div>{line}</div>)}
                </div>
              ) : (
                <textarea
                  style={styles.answer}
                  id={key}
                  readOnly={this.props.readonly}
                  onChange={this.handleAnswerChanged}
                >
                  {answer}
                </textarea>
              )}
              <hr style={styles.hr} />
            </div>
          );
        })}
        {this.state.dirtyAnswers && !this.props.readonly && (
          <button style={styles.primaryButton} onClick={this.handleSaveAnswers}>
            Save
          </button>
        )}
      </React.Fragment>
    );
  }
}

Answers.propTypes = propTypes;
Answers.defaultProps = defaultProps;