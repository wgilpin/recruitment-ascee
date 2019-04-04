import PropTypes from "prop-types";
import React from "react";
import TableBase from "./TableBase";

const propTypes = {
  alt: PropTypes.string
};

const defaultProps = {};

export default class TableCalendar extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = "event_date";
    this.scope = "calendar";
    this.addField(TableBase.kinds().text, "title");
    this.addField(TableBase.kinds().date, "event_date", "Date");
    this.setDetailer("calendar", this.formatEvent, "event_id");
  }

  formatEvent(data, parent) {
    const topStyle = { marginLeft: "20px", textAlign: "left", fontWeight: 500 };
    const textStyle = {
      paddingLeft: "20px",
      textAlign: "left",
      display: "table-cell",
      width: "100%"
    };
    return (
      <React.Fragment>
        <div style={topStyle}>From: {parent.owner_name}</div>
        <div
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: parent.text }}
        />
      </React.Fragment>
    );
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
