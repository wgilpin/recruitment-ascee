import React from 'react';
import PropTypes from 'prop-types';
import { TabPanel } from 'react-tabs';
import Alt from '../Alt';
import UpImg from '../images/arrow_up_24x24.png';
import DownImg from '../images/arrow_down_24x24.png';
import TableStyles from '../TableStyles';
import SearchImg from '../images/magnifying_glass_24x24.png';
import FetchData from '../common/FetchData';


const primary = TableStyles.styles.themeColor.color;

const styles = {
  searchButton: {
    borderRadius: '3px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'darkgray',
    backgroundColor: '#0000',
    padding: '6px',
  },
  smallButtonImg: {
    width: '20px',
    height: '20px',
  },
  h1: {
    color: primary,
  },
  h2: {
    color: primary,
  },
  userLine: {
    justifyItems: 'left',
    textAlign: 'left',
    padding: '12px',
  },
  moveButtons: {
    paddingLeft: '24px',
    position: 'relative',
    top: '11px',
  },
  searchInput: {
    backgroundColor: `#000`,
    borderStyle: `solid`,
    borderWidth: `1px`,
    borderColor: `darkgray`,
    height: `23px`,
    padding: `6px`,
    float: 'right',
  },
  searchBtnOuter: {
    float: 'right',
    cursor: 'pointer',
    marginRight: '12px',
  },
  tab: {
    width: '20%',
  }
};

const propTypes = {};

const defaultProps = {};

export default class AdminRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      staff: {},
      searchText: '',
      searchResults: [],
    };
  }

  arrayToObject(arr, keyField) {
    return arr.reduce((acc, val) => ({ ...acc, [val[keyField]]: val}), {})
  }

  componentWillMount() {
    new FetchData({ scope: 'admin/users' })
      .get()
      .then(data => this.setState({ staff: this.arrayToObject(data.info || {}, 'id') }));
  }

  filterStaff(role) {
    // filter by is_<role>, e.g. is_admin
    return Object
      .values(this.state.staff || {})
      .filter(c => !!(c[`is_${role}`]));
  }

  handleSearch() {
    // TODO:
    new FetchData({ scope: 'character/find', param1: this.state.searchText })
      .get()
      .then(res => {
        this.setState({ searchResults: res });
      });
  }

  async writeRoles(id, newRole) {
    let roles = {
      recruiter: false,
      senior_recruiter: false,
      admin: false,
    }
    switch(newRole) {
      case 1:
        roles.recruiter = true;
        break;
      case 2:
        roles.senior_recruiter = true;
        break;
      case 3:
        roles.admin = true;
        break;
      default:
        // nada
    }
    await new FetchData({ id, scope: 'admin', param1: 'set_roles' })
      .get(roles);
    return new FetchData({ scope: 'admin/users' })
      .get()
      .then(data => this.setState({ staff: data }));
  }

  handleMove(id, direction) {
    // TODO: + confirm dixt in API
    const user = this.state.staff[id];
    let oldState = 0;
    if (user.isRecruiter) {
      oldState = 1;
    }
    if (user.isSnrRecruiter) {
      oldState = 2;
    }
    if (user.isAdmin) {
      oldState = 3;
    }
    let newState = oldState + (direction === 'up' ? 1 : -1);
    newState = Math.min(newState, 3);
    newState = Math.max(newState, 0);
    this.writeRoles(id, newState).then(() => {
      this.setState({
        staff: {
          ...this.state.staff,
          [id]: {
            ...this.state.staff[id],
            isAdmin: newState === 3,
            isSnrRecruiter: newState === 2,
            isRecruiter: newState === 1,
          },
        },
      });
    } )

  }

  makeSearchResultLine(char) {
    // TODO:
    return (
      <div>
        {char.name}
        <img
          style={styles.moveButtons}
          src={UpImg}
          alt="up"
          onClick={() => this.handleMove(char.id, 'up')}
        />
        <img
          style={styles.moveButtons}
          src={DownImg}
          alt="up"
          onClick={() => this.handleMove(char.id, 'down')}
        />
      </div>
    );
  }

  sortByNameFn(a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  }

  sectionList(label, list) {
    /*
     * create a list of users for display
     *
     * @param {label} string - text lable for the section
     * @param {list} [object] - list of users
     * @returns jsx
     */
    return [
      <div style={styles.h2}>{label}</div>,
      list.length > 0 ? (
        list
          .sort(this.sortByNameFn)
          .map(user => this.recruitLine(user.id, user))
      ) : (
          <div style={styles.noneText}>None</div>
        ),
    ];
  }

  recruitLine(id, recruiter) {
    return (
      <div key={id} style={styles.userLine}>
        <Alt
          onClick={() => this.handleClick(id)}
          name={recruiter.name}
          id={recruiter.id}
          style={{ float: 'left', width: '250px' }} />
        <img
          style={styles.moveButtons}
          src={UpImg}
          alt="up"
          onClick={() => this.handleMove(id, 'up')}
        />
        <img
          style={styles.moveButtons}
          src={DownImg}
          alt="up"
          onClick={() => this.handleMove(id, 'down')}
        />
      </div>
    );
  }

  updateSearchText(evt) {
    this.setState({
      searchText: evt.target.value,
    });
  }

  buildRolesPanel = () => {
    const admins = this.filterStaff('admin');
    const recruiters = this.filterStaff('recruiter');
    const snrRecruiters = this.filterStaff('snr_recruiter');
    return <>
        <h2>Roles</h2>
        {this.sectionList('Admins', admins)}
        <hr />
        {this.sectionList('Senior Recruiters', snrRecruiters)}
        <hr />
        {this.sectionList('Recruiters', recruiters)}
        <hr />
        <div style={styles.h2}>Others</div>
        <div>
          <div>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="search..."
              onChange={this.updateSearchText}
              value={this.state.searchText}
            />
          </div>
          <div>
            {this.state.searchResults.forEach(char =>
              this.makeSearchResultLine(char),
            )}
          </div>
          <div style={styles.searchBtnOuter}>
            <button onClick={this.handleSearch} style={styles.searchButton}>
              <img style={styles.smallButtonImg} src={SearchImg} alt="Search" />
            </button>
          </div>
        </div>
      </>

  };

  render() {
    return this.buildRolesPanel();
  }
}

AdminRoles.propTypes = propTypes;
AdminRoles.defaultProps = defaultProps;
