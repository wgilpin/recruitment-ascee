import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TableStyles from './TableStyles';


const propTypes = {};

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  isRead: {
    fontWeight: 'normal',
  },
  isUnread: {
    fontWeight: 'bold',
  },
  redList: {
    fontWeight: 600,
    color: 'red',
  },
};

export default function MailItem(props) {
  const {
    msgId,
    message: {
      timestamp,
      from,
      from_name,
      recipients,
      subject,
      is_read,
      redlisted,
    },
    targetId,
  } = props;
  let lineStyle, formattedDate;
  let readStyle = is_read ? styles.isRead : styles.isUnread;

  lineStyle = msgId % 2 === 0 ? styles.isOdd : {};
  lineStyle = { ...lineStyle, ...readStyle, ...styles.cell };
  formattedDate = moment(timestamp).format('DD-MMM-YYYY HH:MM');
  let nameStyle = { ...lineStyle };
  const { recipient_name } = recipients[0];
  let otherParty = from_name;
  if (targetId === from.toString()) {
    otherParty = `TO: ${recipient_name}`;
  }
  if (redlisted.indexOf('from_name') > -1) {
    nameStyle = { ...lineStyle, ...styles.redList };
  }
  return (
    <div  style={styles.row} onClick={() => props.onClickMessage(msgId)}>
      <div style={lineStyle}>{formattedDate}</div>
      <div style={nameStyle}>{otherParty}</div>
      <div style={lineStyle}>{subject}</div>
    </div>
  );
}

MailItem.propTypes = propTypes;
MailItem.defaultProps = defaultProps;
