import PropTypes from 'prop-types';
import React from 'react';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableCalendar extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'event_date';
    this.scope = 'calendar';
    this.addTextField('title');
    this.addDateField('event_date', 'Date');
    this.setDetailer(
      'calendar',
      this.formatEvent,
      'event_id');
  }

  formatEvent(data, parent) {
    const toStyle={ marginLeft: '40px', textAlign: 'left' };
    const topStyle={ marginLeft: '20px', textAlign: 'left' };
    return <React.Fragment>
        <div style={topStyle}>From: {parent.sender}</div>
        <div style={topStyle}>  To:</div>
        <div>
          {data.info.map(name => <div style={toStyle}>{name}</div>)}
        </div>
      </React.Fragment>
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;