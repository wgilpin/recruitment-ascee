import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  corporations: PropTypes.array, 
  selected: PropTypes.string, 
  corporationId: PropTypes.number, 
  corpRedlisted: PropTypes.bool,
  corporationName: PropTypes.string,
  secStatus: PropTypes.number,
  onClickCorp: PropTypes.func,
};

const defaultProps = {};

const styles = {
  corporation: {
    maxWidth: '300px',
  },
  corpCEO: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#01799A',
    maxWidth: '300px',
  },
  secStatus: {
    fontWeight: 500,
  },
  red: {
    color: 'red',
    fontWeight: 500,
  },
  summary: {
    backgroundColor: '#222',
    padding: '4px',
  },
};

export default function AltSummary(props) {
  const { corporations, selected, corporationId, corpRedlisted, corporationName, secStatus } = props;
  if (!corporations) {
    return;
  }
  const isCEO =
    (corporations[corporationId] || {}).ceo_id === parseInt(selected);
  let corpStyle = isCEO ? styles.corpCEO : styles.corporation;
  if (corpRedlisted) {
    corpStyle = { ...corpStyle, ...styles.red };
  }
  return (
    <div style={styles.summary}>
      <div>
        <div style={styles.secStatus}>
          Sec Status: {Math.round(secStatus * 100) / 100}
        </div>
        <div>
          Corp {isCEO && '[CEO]'}&emsp;
          <span
            style={corpStyle}
            onClick={() => props.onClickCorp(corporationId)}
          >
            {corporationName}
          </span>
        </div>
      </div>
    </div>
  );
}

AltSummary.propTypes = propTypes;
AltSummary.defaultProps = defaultProps;
