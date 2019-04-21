import React from 'react';
import Alt from '../common/Alt';
import TrueImg from '../images/check_box_white.png';
import FalseImg from '../images/check_box_outline_blank.png';
import PromoteImg from '../images/add_circle_outline.png';
import TableStyles from '../evidence/TableStyles';
import FetchData from '../common/FetchData';
import FindESICharacter from './FindESICharacter';
import Confirm from '../common/Confirm';

const primary = TableStyles.styles.themeColor.color;

const styles = {
  ...TableStyles.styles,
  outer: {
    maxWidth: '500px',
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
  },
  find: {
    marginTop: '24px',
  }
};

const propTypes = {};

const defaultProps = {};

export default class AdminRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      staff: {},
      showConfirm: false,
      changedId: null,
      changedField: null,
    };
  }

  arrayToObject(arr, keyField) {
    return arr.reduce((acc, val) => ({ ...acc, [val[keyField]]: val }), {});
  }

  componentWillMount = () => {
    new FetchData({ scope: 'admin/users' })
      .get()
      .then(data =>
        this.setState({
          staff: this.arrayToObject(data.info || {}, 'id'),
          showConfirm: false,
        })
      );
  };

  sortByNameFn([aId, aData], [bId, bData]) {
    if (aData.name > bData.name) {
      return 1;
    }
    if (aData.name < bData.name) {
      return -1;
    }
    return 0;
  }

  doChange = () => {
    let params;
    const id = this.state.changedId;
    const field = this.state.changedField;
    if (this.state.staff[id]) {
      params = { ...this.state.staff[id] };
      console.log('from',params[field],'to',!params[field])
      params[field] = !params[field];
    } else {
      console.log('new')
      params = {
        is_recruiter: true
      }
    }
    return new FetchData({ id, scope: 'admin', param1: 'set_roles' })
      .get(params)
      .then(this.componentWillMount);
  };

  handleClickCheck = (changedId, changedField)  => {
    this.setState({
      showConfirm: true,
      changedField,
      changedId,
      confirmText:
        `Set ${this.state.staff[changedId].name} ${changedField} to ${!this.state.staff[changedId][changedField]}`})
  }

  buildCheck = (id, data, field) => (
    <img
      src={!!data[field] ? TrueImg : FalseImg}
      onClick={() => this.handleClickCheck(id, field)}
      alt={!!data[field] ? 'Yes' : 'No'}
    />
  );

  buildStaffRow = ([id, data]) => {
    return (
      <div style={styles.row}>
        <div style={styles.cell}>
          <Alt id={id} name={data.name} />
        </div>
        <div style={styles.cell}>
          {this.buildCheck(id, data, 'is_recruiter')}
        </div>
        <div style={styles.cell}>
          {this.buildCheck(id, data, 'is_senior_recruiter')}
        </div>
        <div style={styles.cell}>{this.buildCheck(id, data, 'is_admin')}</div>
      </div>
    );
  };

  handlePromote = (userId, action, userName) => {
    this.setState({
      showConfirm: true,
      changedField: 'is_recruiter',
      changedId: userId,
      confirmText:
        `Promote ${userName} to Recruiter`,
    })
  }

  render() {
    return [
      <div style={{ ...styles.table, ...styles.outer }}>
        <div style={styles.header}>
          <div style={styles.cell}>Name</div>
          <div style={styles.cell}>Recruiter</div>
          <div style={styles.cell}>Senior</div>
          <div style={styles.cell}>Admin</div>
        </div>
        <div style={styles.body}>
          {Object.entries(this.state.staff).sort(this.sortByNameFn).map(this.buildStaffRow)}
        </div>
      </div>,
      <div style={styles.find}>
        <FindESICharacter
          onChange={this.handlePromote}
          iconList={[{ name: 'recruiter', img: PromoteImg }]}
        />
      </div>,
      this.state.showConfirm &&
        <Confirm
          text={this.state.confirmText}
          onConfirm={this.doChange}
          onClose={() => this.setState({ showConfirm: false })}
        />
    ];
  }
}

AdminRoles.propTypes = propTypes;
AdminRoles.defaultProps = defaultProps;
