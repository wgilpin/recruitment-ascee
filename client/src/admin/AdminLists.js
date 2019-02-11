import React from 'react';
import PropTypes from 'prop-types';
import { TabPanel } from 'react-tabs';

const propTypes = {};

const defaultProps = {};

const styles = {
  select: {
    transform: 'scale(1.5)'
  },
  ul: {
    listStyleType: 'none'
  },
  li: {
    height: '32px',
    borderStyle: 'solid',
    borderSize: '1px',
  }
}

export default class AdminLists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
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
    this.setState({ list: [{ name: 'Billy Anto', id: 1}, { name:'Tommy Sos', id:2}]})
  }

  render() {
    return (
      <>
        <h2>Redlists</h2>
        <select style={styles.select}>
          {AdminLists.list_kinds.map(kind => <option value={kind}>{kind}</option>)}
        </select>
        <ul style={styles.listbox}>
          {this.state.list.map(item => <li key={item.key} style={styles.li}>{item.name}</li>)}
        </ul>
      </>
    );
  }
}

AdminLists.propTypes = propTypes;
AdminLists.defaultProps = defaultProps;