import React from 'react';
import Alt from '../Alt';
import UpImg from '../images/arrow-up.png';
import DownImg from '../images/arrow-down.png';
import TableStyles from '../TableStyles';
import FetchData from '../common/FetchData';
import FindESICharacter from './FindESICharacter';


const primary = TableStyles.styles.themeColor.color;

const styles = {
  outer: {
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  names: {
    float: 'left',
    width: '200px',
    verticalAlign: 'middle',
    position: 'unset',
    paddingTop: '4px',
  },
  smallButtonImg: {
    width: '20px',
    height: '20px',
  },
  h1: {
    color: primary,
  },
  h2: {
    padding: '8px',
    color: primary,
    fontWeight: 600,
  },
  userLine: {
    justifyItems: 'left',
    textAlign: 'left',
    padding: '12px',
  },
  moveButtons: {
    paddingLeft: '24px',
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
          style={styles.names} />
        {!recruiter.is_admin && <img
          style={styles.moveButtons}
          src={UpImg}
          alt="up"
          onClick={() => this.handleMove(id, 'up')}
        />}
        <img
          style={styles.moveButtons}
          src={DownImg}
          alt="up"
          onClick={() => this.handleMove(id, 'down')}
        />
      </div>
    );
  }

  buildRolesPanel = () => {
    const admins = this.filterStaff('admin');
    const recruiters = this.filterStaff('recruiter');
    const snrRecruiters = this.filterStaff('snr_recruiter');
    return <div style={styles.outer}>
        <h2>Roles</h2>
        {this.sectionList('Admins', admins)}
        <hr />
        {this.sectionList('Senior Recruiters', snrRecruiters)}
        <hr />
        {this.sectionList('Recruiters', recruiters)}
        <hr />
        <div style={styles.h2}>Others</div>
        <FindESICharacter
          onChange={this.handleMove}
          iconList={[
            { img: UpImg, name: 'up'},
            { img: DownImg, name: 'down'},
          ]}
        />
      </div>

  };

  render() {
    return this.buildRolesPanel();
  }
}

AdminRoles.propTypes = propTypes;
AdminRoles.defaultProps = defaultProps;
