import React from 'react';
import FetchData from '../common/FetchData';
import DeleteImg from '../images/baseline_delete_white_24dp.png';
import CommonStyles from '../common/Styles';

const styles = {
  ...CommonStyles,
  outer: {
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
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

class AdminQuestion extends React.Component {
  render() {
    const { id, text } = this.props;
    return (
      <>
        <textarea
          style={styles.answer}
          id={id}
          onChange={this.handleAnswerChanged}
          cols="50"
          value={text}
        />
        <div style={styles.buttonBar}>
          <img
            style={styles.toolbarImg}
            onClick={() => this.handleDelete(id)}
            src={DeleteImg}
            alt="delete"
          />
        </div>
        <hr style={styles.hr} />
      </>
    );
  }
}

export default class AdminQuestions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // questions: { id: text,...}
      questions: {},
      dirty: false,
    };
  }

  arrayToObject(arr, keyField) {
    return arr.reduce((acc, val) => ({ ...acc, [val[keyField]]: val }), {});
  }

  componentWillMount() {
    let fetchQs = new FetchData({ scope: 'questions' });
    fetchQs.get().then(data => this.setState({ questions: data }));
  }

  handleAnswerChanged = e => {
    this.setState({
      questions: {
        ...this.state.questions,
        [e.target.id]: e.target.value,
      },
      dirty: true,
    });
  };

  handleSubmit = () => {
    new FetchData({ scope: 'answers' })
      .put(
        Object.entries(this.state.questions).map(([question_id, text]) => ({
          question_id,
          text,
        }))
      )
      .then(() => {
        this.setState({ dirty: false });
      });
  };

  handleDelete = id => {
    const newQuestions = Object.assign({}, this.state.questions);
    delete newQuestions[id];
    this.setState({ questions: newQuestions, dirty: true });
  };

  render() {
    const { questions, dirty } = this.state;
    Object.entries(questions).map(([k, v]) => console.log(k, v));
    return (
      <div style={styles.outer}>
        <h2 style={styles.heading}>Applicant Questions</h2>
        {Object.entries(questions).map(([id, text]) => {
          return <AdminQuestion id={id} text={text} />;
        })}
        {dirty && (
          <button
            style={styles.styles.primaryButton}
            onClick={this.handleSubmit}
          >
            Save
          </button>
        )}
      </div>
    );
  }
}
