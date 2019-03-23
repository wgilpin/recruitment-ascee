import React from 'react';
import ReactModal from 'react-modal';
import FetchData from '../common/FetchData';
import DeleteImg from '../images/baseline_delete_white_24dp.png';
import CommonStyles from '../common/Styles';
import FabButton from '../common/fabButton';
import Confirm from '../Confirm';


const styles = {
  ...CommonStyles,
  outer: {
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'relative',
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
  fab: {
    float: 'right',
    position: 'inherit',
  }
};

class AdminQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.textareaRef = React.createRef();
  }

  handleDelete = (id) => {
    if (this.props.onDelete){
      this.props.onDelete(id);
    }
  }

  handleChange = () => {
    if (this.props.onChange){
      this.props.onChange(this.props.id, this.textareaRef.current.value);
    }
  }

  render() {
    const { id, text } = this.props;
    return (
      <>
        <textarea
          style={styles.answer}
          id={id}
          onChange={this.handleChange}
          cols="50"
          value={text}
          ref={this.textareaRef}
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
      showConfirm: false,
    };
  }

  arrayToObject(arr, keyField) {
    return arr.reduce((acc, val) => ({ ...acc, [val[keyField]]: val }), {});
  }

  componentWillMount = () => {
    let fetchQs = new FetchData({ scope: 'questions' });
    fetchQs.get().then(data => this.setState({ questions: data }));
  }

  handleAnswerChanged = (id, value) => {
    this.setState({
      questions: {
        ...this.state.questions,
        [id]: value,
      },
      dirty: true,
    });
  };

  handleSubmit = () => {
    const questions = Object.entries(this.state.questions).map(([question_id, text]) => ({
      question_id,
      text,
    }))
    if (this.state.newQuestion) {
      questions.push({text: ''});
      this.setState({ newQuestion: false });
    }
    return new FetchData({ scope: 'admin/set_questions' })
      .put({ questions })
      .then(() => {
        this.setState({ dirty: false });
      });
  };

  handleDelete = id => {
    this.setState({ showConfirm: true, deleteId: id })
  }

  confirmedDelete = () => {
    const newQuestions = Object.assign({}, this.state.questions);
    delete newQuestions[this.state.deleteId];
    this.setState({ questions: newQuestions, dirty: true, showConfirm: false });
  };

  handleAdd = () => {
    this.setState({
      newQuestion: true,
      dirty: true,
    },
    () => {
      this.handleSubmit()
        .then(this.componentWillMount);
    });
  }

  render() {
    const { questions, dirty } = this.state;
    if (!questions) {
      return;
    }
    Object.entries(questions).map(([k, v]) => console.log(k, v));
    return (
      <div style={styles.outer}>
        <h2 style={styles.heading}>Applicant Questions</h2>
        {Object.entries(questions).map(([id, text]) => {
          return <AdminQuestion
            id={id}
            text={text}
            onDelete={this.handleDelete}
            onChange={this.handleAnswerChanged}
          />;
        })}
        <FabButton icon="add" color="#c00" size="40px" style={styles.fab} onClick={this.handleAdd} />
        {dirty && (
          <button
            style={styles.styles.primaryButton}
            onClick={this.handleSubmit}
          >
            Save
          </button>
        )}
        {this.state.showConfirm &&
          <Confirm
            text="Delete Question"
            onConfirm={this.confirmedDelete}
            onClose={() => this.setState({ showConfirm: false })}
          />
        }
      </div>
    );
  }
}
