import React from 'react';
import Loader from 'react-loader-spinner';
import TableStyles from '../evidence/TableStyles';
import Styles from '../common/Styles';
import RoundImage from '../common/RoundImage';
import FabButton from '../common/fabButton';
import deleteImg from '../images/delete-white.svg';
import FetchData from '../common/FetchData';
import FindItem from './FindItem';
import Confirm from '../common/Confirm';

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
    marginBottom: '24px',
  },
  fab: {
    float: 'right',
    marginTop: '30px',
    position: 'inherited',
  },
};

export default class AdminLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
      kind: 'character',
      selectedItem: {},
      showConfirm: false,
      loading: true,
    };
  }

  static list_kinds = {
    character: 'Red Character',
    inventory_type: 'Flagged Type',
    alliance: 'Red Alliance',
    corporation: 'Red Corporation',
    system: 'Red System',
    user: 'User Blocked From Applying',
    region: 'Region',
  };

  titleise(text) {
    return (text[0].toUpperCase() + text.slice(1)).replace(/_/g, ' ');
  }

  componentDidMount() {
    this.doLoad();
  }

  doFetch = (scope) => new FetchData(scope).get();
  doFetchDelete = (scope) => new FetchData(scope).delete();

  doLoad = () => {
    const lists = {};
    const promises = [];
    const fetcher = this.props.fetcher || this.doFetch;
    for (let kind of Object.keys(AdminLists.list_kinds)) {
      promises.push(
        fetcher({ id: kind, scope: 'admin/list' }).then(list => {
          lists[kind] = list.info;
        })
      );
    }
    Promise.all(promises).then(() => {
      const showInput =
        lists.length === 0 || lists[this.state.kind].length === 0;
      this.setState({ lists, showInput, loading: false });
    });
  };

  handleConfirmDelete(id) {
    const selectedItem = this.state.lists[this.state.kind].filter(
      it => it.id === id
    )[0];
    this.setState({
      showConfirm: true,
      selectedItem: selectedItem,
    });
  }

  handleDelete = async () => {
    const fetcher = this.props.fetcher || this.doFetchDelete;
    await fetcher({
      id: this.state.kind,
      scope: 'admin/list',
      param1: 'delete',
      param2: this.state.selectedItem.id,
    });
    this.setState({ showConfirm: false });
    this.componentDidMount();
  };

  handleChangeKind = event => {
    this.setState({
      kind: event.target.value,
      showInput: this.state.lists[event.target.value].length === 0,
      showAddMany: false,
    });
  };

  handleAddFab = () => {
    this.setState({ showInput: true });
  };

  handleDoAdd = async () => {
    await this.searchOne();
    this.setState({ showInput: false });
  };

  handleDoAddMany = () => {
    this.setState({ showAddMany: false });
  };

  makeListLine(item, idx) {
    const lineStyle = {
      ...(idx % 2 === 0 ? styles.isOdd : {}),
      ...styles.row,
    };
    const characterImgSrc = `https://image.eveonline.com/Character/${
      item.id
    }_64.jpg`;
    const typeImgSrc = `https://image.eveonline.com/Type/${item.id}_64.png`;
    return (
      <div key={item.id} style={lineStyle}>
        {this.state.kind === 'character' && (
          <div style={styles.cell}>
            <RoundImage src={characterImgSrc} />
          </div>
        )}
        {this.state.kind === 'inventory_type' && (
          <div style={styles.cell}>
            <img
              style={{ width: '20px', height: '20px' }}
              src={typeImgSrc}
              alt=" "
            />
          </div>
        )}

        <div style={{ ...styles.cell, verticalAlign: 'middle' }}>
          {item.name}
        </div>
        <div
          style={{ ...styles.cell, verticalAlign: 'middle', cursor: 'pointer' }}
        >
          <img
            src={deleteImg}
            onClick={() => this.handleConfirmDelete(item.id)}
            alt="delete"
          />
        </div>
      </div>
    );
  }

  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    const { kind, lists } = this.state;
    return (
      <div style={styles.outer}>
        <h2>Redlists</h2>
        <select style={styles.selectPrimary} onChange={this.handleChangeKind}>
          {Object.entries(AdminLists.list_kinds).map(
            ([option_kind, option_text]) => (
              <option value={option_kind}>{option_text}</option>
            )
          )}
        </select>
        <div style={styles.listbox}>
          {(lists[kind] || [])
            .sort((a, b) => (a.name < b.name ? -1 : ( a.name > b.name ? 1 : 0)))
            .map((item, idx) => this.makeListLine(item, idx))}
        </div>
        {this.state.showInput && (
          <FindItem kind={this.state.kind} onChange={this.doLoad} />
        )}
        {!this.state.showInput && (
          <FabButton
            onClick={this.handleAddFab}
            icon="add"
            color="#c00"
            size="40px"
            style={styles.fab}
          />
        )}
        {this.state.showConfirm && (
          <Confirm
            text={`Remove item from redlist`}
            onConfirm={this.handleDelete}
            onClose={() => this.setState({ showConfirm: false })}
          />
        )}
      </div>
    );
  }
}

AdminLists.propTypes = propTypes;
AdminLists.defaultProps = defaultProps;
