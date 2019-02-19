import React from 'react';
import TableStyles from '../TableStyles';
import RoundImage from '../common/RoundImage';
import FabButton from '../common/fabButton';
import Styles from '../common/Styles';
import deleteImg from '../images/delete-white.svg';
import FetchData from '../common/FetchData';


const propTypes = {};

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  ...Styles.styles,
  listbox: {
    display: 'table',
    width: '200px',
  },
  li: {
    height: '32px',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  textarea: {
    backgroundColor: Styles.themeColors.secondary,
    border: 'none',
    textAlign: 'left',
    padding: '8px',
    color: 'white',
  },
  input: {
    textAlign: 'left',
    width: '140px',
    height: '40px',
    padding: '8px',
    color: 'white',
    backgroundColor: Styles.themeColors.secondary,
    border: 'none',
  },
  leftDiv :{
    textAlign: 'left',
    padding: '8px',
  },
  selectPrimary: {
    transform: 'scale(1.5)',
    color: 'white',
    backgroundColor: Styles.themeColors.primary,
    border: 'none',
  }
}

export default class AdminLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      kind: '',
    };
    this.textInput = React.createRef();
  }

  static list_kinds = [
    'character',
    'type',
    'channel',
    'alliance',
    'corporation',
    'system'
  ];

  titleise(text) {
    return (text[0].toUpperCase() + text.slice(1)).replace(/_/g, ' ');
  }

  componentDidMount() {
    this.setState({
      kind: 'character',
      list: [{ name: 'Billy Anto', id: 92900739 }, { name: 'Tommy Sos', id: 91027948 }],
    })
  }

  submitOne() {
    const name = this.textInput.current.value;
    new FetchData(
      { id: this.state.kind, scope: 'admin/lists', param1: 'add' },
    ).put({ replace: false, names: [name]})
      .then(data => {
        alert(data)
      });
  }

  handleDelete(id) {
    alert(`del ${id} not implemented`)
  }

  handleChangeKind = (event) => {
    this.setState({ kind: event.target.value });
  }

  handleAddFab = () => {
    this.setState({ showInput: true, showAddMany: false })
  }

  handleClickAddMany = () => {
    this.setState({ showAddMany: true, showInput: false })
  }

  handleDoAdd = () => {
    this.submitOne()
    this.setState({ showInput: false })
  }

  handleDoAddMany = () => {
    this.setState({ showAddMany: false })
  }

  makeListLine(item, idx) {
    const lineStyle = {
      ...(idx % 2 === 0 ? styles.isOdd : {}),
      ...styles.row,
    };
    const imgSrc = `https://image.eveonline.com/Character/${item.id}_64.jpg`;
    return <div key={item.key} style={lineStyle}>
      {this.state.kind === 'character' &&
        <div style={styles.cell}>
          <RoundImage src={imgSrc}></RoundImage>
        </div>
      }
      <div style={styles.cell}>
        {item.name} {idx}
      </div>
      <div style={styles.cell}>
        <img src={deleteImg} onClick={() => this.handleDelete(item.id)} alt='delete' />
      </div>
    </div>
  }

  render() {
    return (
      <>
        <h2>Redlists</h2>
        <select style={styles.selectPrimary} onChange={this.handleChangeKind}>
          {AdminLists.list_kinds.map(kind => <option value={kind}>{kind}</option>)}
        </select>
        <div style={styles.listbox}>
          {this.state.list.map((item, idx) => this.makeListLine(item, idx))}
        </div>
        {this.state.showInput &&
        <div style={styles.leftDiv}>
          <input type='text' placeholder='add name' style={styles.input} ref={this.textInput} />
          <button style={styles.smallPrimary} onClick={this.handleDoAdd}>Add+</button>
          <br/>
          <button
            style={{ ...styles.linkButton, marginTop: '6px' }}
            onClick={this.handleClickAddMany}>
              Add Many
          </button>
        </div>
        }
        {this.state.showAddMany &&
        <div style={styles.leftDiv}>
          <textarea rows="10" cols="60" style={styles.textarea}></textarea>
          <br/>
          <button style={styles.smallPrimary} onClick={this.handleDoAddMany}>Submit</button>
        </div>
        }
        <FabButton onClick={this.handleAddFab} icon="add" color="#c00" size="40px" />
      </>
    );
  }
}

AdminLists.propTypes = propTypes;
AdminLists.defaultProps = defaultProps;