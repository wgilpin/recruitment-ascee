import React from 'react';
import PropTypes from 'prop-types';
import FetchData from './FetchData';
import TableStyles from './TableStyles';
import ColumnHeader from './ColumnHeader';

const propTypes = {
  alt: PropTypes.string,
  ContactList: PropTypes.array,
};

const defaultProps = {
};

const styles = TableStyles.styles;

export default class Contacts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'contacts',
      ContactList: [],
      sortedColumn: null,
    };
  }

  componentDidMount() {
    new FetchData(
      { id: this.props.alt, scope: this.state.scope },
    ).get()
      .then(data => {
        if (data.length !== (this.state.ContactList || []).length) {
          this.setState({ ContactList: data })
        }
      });
  }

  static ContactLine(idx, contact) {
    let { name, creationDate, corporation_id, alliance_id } = contact.contact_id;
    let { Blacklist_standing } = contact;
    let lineStyle =
      (idx % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    let newdate = new Date(creationDate);
    let theDate = creationDate === "DATE" ? creationDate : newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();

    return (
      <div style={styles.row} key={idx}>
        <div style={lineStyle}>{name}</div>
        <div style={lineStyle}>{(corporation_id || {}).ticker}</div>
        <div style={lineStyle}>{(alliance_id || {}).ticker}</div>
        <div style={lineStyle}>{Blacklist_standing}</div>
        <div style={lineStyle}>{theDate}</div>
      </div>
    )
  }

  sortColumn = (label) => {
    console.log('sortColumn', label)
    this.setState({ sortedColumn: label });
  }

  sortFn = (a, b) => {
    let ca = this.state.ContactList[a];
    let cb = this.state.ContactList[b];
    try {
      switch (this.state.sortedColumn) {
        case 'NAME':
          return ca.contact_id.name.localeCompare(cb.contact_id.name);
        case 'CORP':
          let lc = ca.contact_id.corporation_id.name || '';
          // if (!lc){ return 1 };
          let rc = cb.contact_id.corporation_id.name || '';
          // if (!rc){ return -1 };
          return lc.localeCompare(rc);
        case 'ALLIANCE':
          let aa = ca.contact_id.alliance_id.name || '';
          if (!aa){ return 1 };
          let ab = cb.contact_id.alliance_id.name || '';
          if (!ab){ return -1 };
          return aa.localeCompare(ab);
        case 'STANDING':
          return cb.Blacklist_standing - ca.Blacklist_standing;
        case 'CREATED':
          let db = new Date(cb.creationDate);
          let da = new Date(ca.creationDate);
          return db - da;
        default:
          return 0;
      }
    } catch (e) {
      debugger;
      console.log(e)
    }
  }

  render() {
    let sort = this.state.sortedColumn;
    return (
      <div style={styles.div}>
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <ColumnHeader label="NAME" sorted={sort === 'NAME'} onToggleSort={this.sortColumn} />
            <ColumnHeader label="CORP" sorted={sort === 'CORP'} onToggleSort={this.sortColumn} />
            <ColumnHeader label="ALLIANCE" sorted={sort === 'ALLIANCE'} onToggleSort={this.sortColumn} />
            <ColumnHeader label="STANDING" sorted={sort === 'STANDING'} onToggleSort={this.sortColumn} />
            <ColumnHeader label="CREATED" sorted={sort === 'CREATED'} onToggleSort={this.sortColumn} />
          </div>
          {Object.keys(this.state.ContactList).sort(this.sortFn).map((key, idx) => {
            return Contacts.ContactLine(idx, this.state.ContactList[key])
          })}
        </div>
      </div>
    );
  }
}

Contacts.propTypes = propTypes;
Contacts.defaultProps = defaultProps;