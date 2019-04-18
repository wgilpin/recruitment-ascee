import React from 'react';
import PropTypes from 'prop-types';
import SkillLights from './SkillLights';
import TableStyles from './TableStyles';

const propTypes = {
  line: PropTypes.shape({
    finish_date: PropTypes.string,
    start_date: PropTypes.string,
    start_level: PropTypes.number,
    finished_level: PropTypes.number,
    skill_id: PropTypes.number,
  }),
  index: PropTypes.number,
  start: PropTypes.number,
  finish: PropTypes.number,
};

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  progress: {
    backgroundColor: '#444',
    color: '#0084A8',
    height: '7px',
  },
};

export default function SkillQLine(props) {
  const {
    index, 
    start,
    finish,
    line: { finish_date, start_date, finished_level, skill_id },
  } = props;
  let lineStyle =  index % 2 === 0 ? styles.isOdd : {};
  lineStyle = { ...lineStyle, ...styles.cell };
  let startDate = new Date(start_date),
    endDate = new Date(finish_date),
    today = new Date(),
    fullRange = endDate - startDate,
    soFar = today - startDate;
  if (finished_level !== finish) {
    return null;
  }
  return (
    <div style={styles.row}>
      <div style={lineStyle}>{skill_id.skill_name}</div>
      <div style={lineStyle}>
        <SkillLights currentLevel={start - 1} trainLevel={finish} />
      </div>
      <div style={lineStyle}>
        {soFar > 0.0 ? (
          <progress style={styles.progress} value={soFar} max={fullRange} />
        ) : null}
      </div>
    </div>
  );
}

SkillQLine.propTypes = propTypes;
SkillQLine.defaultProps = defaultProps;
