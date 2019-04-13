import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from './TableStyles';

const propTypes = {};

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  body: {
    textAlign: 'left',
    color: 'white',
    fontStyle: 'italic',
    a: { color: 'white' },
    paddingLeft: '60px',
    width: '120%',
  },
};

export default function MailBody(props) {
  return (
    
      <div style={styles.row}>
        <div
          style={styles.body}
          dangerouslySetInnerHTML={{ __html: props.line.body }}
        />
      </div>
    
  );
}

MailBody.propTypes = propTypes;
MailBody.defaultProps = defaultProps;
