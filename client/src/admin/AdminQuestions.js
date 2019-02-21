import React from 'react';
import PropTypes from 'prop-types';
import FetchData from '../common/FetchData';
import DeleteImg from '../images/baseline_delete_white_24dp.png';
import SaveImg from '../images/baseline_save_white_24dp.png';
import CommonStyles from '../common/Styles';

const propTypes = {};

const defaultProps = {};

const styles = {
  ...CommonStyles,
  toolbarImg: {
    height: '24px',
    padding: '16px',
    cursor: 'pointer',
  },
  buttonBar: {
    display: 'inline-block',
  },
  answer: {
    display: 'inline-block',
    marginBottom: '12px',
  },
};

export default class AdminQuestions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: {},
      dirty: false,
    };
  }

  arrayToObject(arr, keyField) {
    return arr.reduce((acc, val) => ({ ...acc, [val[keyField]]: val}), {})
  }

  componentWillMount() {
    let fetchQs = new FetchData({ scope: 'questions' });
    fetchQs.get().then(data => this.setState({ questions: data }));
  }

  handleAnswerChanged = e => {
    this.setState({
      questions:
      {
        ...this.state.questions,
        [e.target.id]: e.target.value,
      },
      dirty: true ,
    });
  }

  render() {
    return (
      <>
        <h2 style={styles.heading}>Applicant Questions</h2>
        {Object.keys(this.state.questions).map(id => {
          return (
            < >
              <textarea
                style={styles.answer}
                id={id}
                onChange={this.handleAnswerChanged}
                cols="70"
              >
                {this.state.questions[id]}
              </textarea>
              <div style={styles.buttonBar}>
                <img style={styles.toolbarImg} src={DeleteImg} alt="delete"/>
              </div>
              <hr style={styles.hr} />
            </>
          );
        })}
        {this.state.dirty && <button style={styles.styles.primaryButton}>Save</button>}
      </>
    );
  };
}

AdminQuestions.propTypes = propTypes;
AdminQuestions.defaultProps = defaultProps;