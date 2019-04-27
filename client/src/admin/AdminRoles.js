import React from 'react';
import Loader from 'react-loader-spinner';
import Alt from '../common/Alt';
import TrueImg from '../images/check_box_white.png';
import FalseImg from '../images/check_box_outline_blank.png';
import PromoteImg from '../images/add_circle_outline.png';
import TableStyles from '../evidence/TableStyles';
import FetchData from '../common/FetchData';
import FindESICharacter from './FindESICharacter';
import Confirm from '../common/Confirm';
import PropTypes from 'prop-types';

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
    marginBottom: '24px',
  }
};

const propTypes = {
  fetcher: PropTypes.func,
};

const defaultProps = {};

export default class AdminRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      staff: {},
      showConfirm: false,
      changedId: null,
      changedField: null,
      loading: true,
    };
  }

  arrayToObject(arr, keyField) {
    return arr.reduce((acc, val) => ({ ...acc, [val[keyField]]: val }), {});
  }

  doFetch = (scope, params) => new FetchData(scope).get(params);

  componentWillMount = async () => {
    const fetcher = this.props.fetcher || this.doFetch;
    const data = await fetcher({ scope: 'admin/users' });
    this.setState({
      staff: this.arrayToObject(data.info || {}, 'id'),
      showConfirm: false,
      loading: false
    })
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

  doChange =async  () => {
    let params;
    const id = this.state.changedId;
    const field = this.state.changedField;
    if (this.state.staff[id]) {
      params = { ...this.state.staff[id] };
      params[field] = !params[field];
    } else {
      params = {
        is_recruiter: true,
      };
    }
    const fetcher = this.props.fetcher || this.doFetch;
    await fetcher({ id, scope: 'admin', param1: 'set_roles' }, params);
    this.componentWillMount();
  };

  handleClickCheck = (changedId, changedField) => {
    this.setState({
      showConfirm: true,
      changedField,
      changedId,
      confirmText: `Set ${
        this.state.staff[changedId].name
      } ${changedField} to ${!this.state.staff[changedId][changedField]}`,
    });
  };

  buildCheck = (id, data, field) => (
    <img
      src={!!data[field] ? TrueImg : FalseImg}
      onClick={() => this.handleClickCheck(id, field)}
      alt={!!data[field] ? 'Yes' : 'No'}
    />
  );

  buildStaffRow = ([id, data]) => {
    return (
      <div style={styles.row} key={id}>
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
      confirmText: `Promote ${userName} to Recruiter`,
    });
  };

  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    return [
      <div style={{ ...styles.table, ...styles.outer }}>
        <div style={styles.header} key="header">
          <div style={styles.cell}>Name</div>
          <div style={styles.cell}>Recruiter</div>
          <div style={styles.cell}>Senior</div>
          <div style={styles.cell}>Admin</div>
        </div>
        <div style={styles.body} key="t-body">
          {Object.entries(this.state.staff)
            .sort(this.sortByNameFn)
            .map(this.buildStaffRow)}
        </div>
      </div>,
      <div style={styles.find}>
        <FindESICharacter
          onChange={this.handlePromote}
          iconList={[{ name: 'recruiter', img: PromoteImg }]}
        />
      </div>,
      this.state.showConfirm && (
        <Confirm
          text={this.state.confirmText}
          onConfirm={this.doChange}
          onClose={() => this.setState({ showConfirm: false })}
        />
      ),
    ];
  }
}

AdminRoles.propTypes = propTypes;
AdminRoles.defaultProps = defaultProps;
