import React from 'reactn';
import PropTypes from 'prop-types';
import styles from './ApplicantStyles';
import FetchData from '../common/FetchData';


const propTypes = {
  onChange: PropTypes.func,
  onHasApplication: PropTypes.func,
  readonly: PropTypes.bool,
  targetId: PropTypes.number,
};

const defaultProps = {};

export default class Answers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dirtyAnswers: false,
    };
  }

  handleAnswerChanged = e => {
    const { id, value } = e.target;
    this.setState(
      {
        dirtyAnswers: true,
      },
      () => {
        this.setGlobal({
          answers: {
            ...this.global.answers,
            [id]: value,
          },
        });
        if (this.props.onChange && ! this.props.readonly) {
          this.props.onChange();
        }
      }
    );
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


  render() {
    return (
      <React.Fragment>
        <h2 style={styles.heading}>Recruitment Questions</h2>
        {Object.keys(this.global.questions || {}).map(key => {
          const question = this.global.questions[key];
          const answer = this.global.answers[key];
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
        {this.state.dirtyAnswers && !this.props.readonly &&(
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
