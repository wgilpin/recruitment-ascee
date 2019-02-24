import React from 'react';
import ReactModal from 'react-modal'
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
  outer: {
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  listbox: {
    display: 'table',
    width: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
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
    height: '33px',
    padding: '4px',
    color: 'white',
    backgroundColor: Styles.themeColors.secondary,
    border: 'none',
  },
  centreDiv: {
    padding: '8px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  selectPrimary: {
    transform: 'scale(1.5)',
    color: 'white',
    backgroundColor: Styles.themeColors.primary,
    border: 'none',
    marginBottom: '12px',
  }
}

export default class AdminLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
      kind: 'character',
      selectedItem: {},
      showModal: false,
    };
    this.textInput = React.createRef();
    this.textArea = React.createRef();
  }

  static list_kinds = [
    'character',
    'type',
    'alliance',
    'corporation',
    'system'
  ];

  titleise(text) {
    return (text[0].toUpperCase() + text.slice(1)).replace(/_/g, ' ');
  }

  componentDidMount() {
    const lists = {};
    const promises = [];
    for (let kind of AdminLists.list_kinds) {
      promises.push(new FetchData({ id: kind, scope: 'admin/list' })
        .get()
        .then((list) => {
          lists[kind] = list.info;
        }));
    }
    Promise.all(promises).then(() => {
      const showInput = this.state.lists.length === 0
        || this.state.lists[this.state.kind].length === 0;
      this.setState({ lists, showInput });
    })
  }

  submitOne() {
    const name = this.textInput.current.value;
    return this.submit([{ name }]);
  }

  submitMany() {
    const names = this.textArea.current.value;
    return this.submit(names);
  }

  submit(items) {
    return new FetchData({ id: this.state.kind, scope: 'admin/list' })
      .put({ replace: false, items });
  }

  handleConfirmDelete(id) {
    const selectedItem = this.state.lists[this.state.kind].filter(it => it.id === id)[0];
    this.setState({
      showModal: true,
      selectedItem: selectedItem,
    })
  }

  handleDelete = async () => {
    await new FetchData({
      id: this.state.kind,
      scope: 'admin/list',
      param1: 'delete',
      param2: this.state.selectedItem.id
    }).delete();
    this.setState({ showModal: false });
    this.componentDidMount();
  }

  handleChangeKind = (event) => {
    this.setState({
      kind: event.target.value,
      showInput: this.state.lists[event.target.value].length === 0,
      showAddMany: false,
    });
  }

  handleAddFab = () => {
    this.setState({ showInput: true, showAddMany: false })
  }

  handleClickAddMany = () => {
    this.setState({ showAddMany: true, showInput: false })
  }

  handleDoAdd = async () => {
    await this.submitOne();
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
    return <div key={item} style={lineStyle}>
      {this.state.kind === 'character' &&
        <div style={styles.cell}>
          <RoundImage src={imgSrc}></RoundImage>
        </div>
      }
      <div style={{ ...styles.cell, verticalAlign: 'middle' }}>
        {item.name}
      </div>
      <div style={{ ...styles.cell, verticalAlign: 'middle', cursor: 'pointer' }}>
        <img src={deleteImg} onClick={() => this.handleConfirmDelete(item.id)} alt='delete' />
      </div>
    </div>
  }

  render() {
    const { kind, lists } = this.state;
    return (
      <div style={styles.outer}>
        <h2>Redlists</h2>
        <select style={styles.selectPrimary} onChange={this.handleChangeKind}>
          {AdminLists.list_kinds.map(option_kind => <option value={option_kind}>{option_kind}</option>)}
        </select>
        <div style={styles.listbox}>
          {(lists[kind] || []).map((item, idx) => this.makeListLine(item, idx))}
        </div>
        {this.state.showInput &&
          <div style={styles.centreDiv}>
            <input type='text' placeholder='add name' style={styles.input} ref={this.textInput} />
            <button style={styles.smallPrimary} onClick={this.handleDoAdd}>Add</button>
            <br />
            <button
              style={{ ...styles.linkButton, marginTop: '6px' }}
              onClick={this.handleClickAddMany}>
              Add Many
          </button>
          </div>
        }
        {this.state.showAddMany &&
          <div style={styles.centreDiv}>
            <textarea rows="10" cols="60" style={styles.textarea} ref={this.textArea} />
            <br />
            <button style={styles.smallPrimary} onClick={this.handleDoAddMany}>Submit</button>
          </div>
        }
        <FabButton onClick={this.handleAddFab} icon="add" color="#c00" size="40px" />

        <ReactModal
          isOpen={this.state.showModal}
          style={styles.modal}>
          <h2 style={styles.modal.title}>Delete {this.state.selectedItem.name} from {this.state.kind}s</h2>
          <p style={styles.modal.text}>Are you sure?</p>
          <button style={styles.smallSecondary} onClick={() => this.setState({ showModal: false })}>No</button>
          <button style={styles.smallPrimary} onClick={this.handleDelete}>yes</button>
        </ReactModal>
      </div>
    );
  }
}

AdminLists.propTypes = propTypes;
AdminLists.defaultProps = defaultProps;