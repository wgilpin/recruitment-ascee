import React from 'react';
import FetchData from '../common/FetchData';
import DeleteImg from '../images/delete.png';
import CommonStyles from '../common/Styles';
import FabButton from '../common/fabButton';
import Confirm from '../common/Confirm';


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
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  answer: {
    display: 'table-cell',
    marginBottom: '8px',
    marginTop: '8px',
    backgroundColor: '#222',
    color: 'white',
    padding: '6px',
    border: 'none',
  },
  fab: {
    float: 'right',
    position: 'relative',
    top: 'unset',
    bottom: 'unset',
    right: 'unset'
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
      <div key={id} style={{display: 'table-row'}}>
        <textarea
          style={styles.answer}
          id={id}
          onChange={this.handleChange}
          cols="50"
          rows="3"
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
        
      </div>
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
    this.setState({ showConfirm: false });
    new FetchData({ scope: 'admin/remove_question', param2: this.state.deleteId })
      .get()
      .then(this.componentWillMount);
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
