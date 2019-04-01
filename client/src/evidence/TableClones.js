import React from 'react';
import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

const styles = {
  header: {

  }
}
export default class TableClones extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'clones';
    this.listName = 'jump_clones'
    this.addField(TableBase.kinds().text,'region_name');
    this.addField(TableBase.kinds().text,'system_name');
    this.addField(TableBase.kinds().text,'location_type');
  }

  showHeader = ({ home_location: {
      location_type,
      system_name,
      region_name,
      redlisted} }) => {
    return (
      <div style={styles.header}>
        Home is a {location_type} in {system_name} / {region_name}
      </div>
    )
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;