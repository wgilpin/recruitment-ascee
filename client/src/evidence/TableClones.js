import React from "react";
import PropTypes from "prop-types";
import TableBase from "./TableBase";

const propTypes = {
  alt: PropTypes.string
};

const defaultProps = {};

const styles = {
  header: {},
  red: {
    fontWeight: 500,
    color: "red"
  }
};
export default class TableClones extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = "name";
    this.scope = "clones";
    this.listName = "jump_clones";
    this.addField(TableBase.kinds().text, "region_name");
    this.addField(TableBase.kinds().text, "system_name");
    this.addField(TableBase.kinds().text, "location_type");
  }

  showHeader = ({
    home_location: { location_type, system_name, region_name, redlisted }
  }) => {
    const systemStyle = redlisted.indexOf("system_name") > -1 ? styles.red : {};
    const regionStyle = redlisted.indexOf("region_name") > -1 ? styles.red : {};
    return (
      <div style={styles.header}>
        Home is a {location_type} in 
        <span style={systemStyle}> {system_name} </span> / 
        <span style={regionStyle}> {region_name} </span>
      </div>
    );
  };
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
