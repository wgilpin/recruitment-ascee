import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from './TableStyles';
import SkillLights from './SkillLights';

const propTypes = {
  idx: PropTypes.number,
  name: PropTypes.string,
  level: PropTypes.number,
};

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  progress: {
    backgroundColor: '#444',
    color: '#0084A8',
    height: '7px',
  },
  skillImage: {
    verticalAlign: 'bottom',
  },
  div: {
    maxWidth: 800,
  },
  total: {
    fontWeight: 500,
    paddingBottom: '12px',
  },
};

export default function SkillLine(props) {
  const { idx, name, level } = props;
  let lineStyle = idx % 2 === 0 ? styles.isOdd : {};
  lineStyle = { ...lineStyle, ...styles.cell };
  return (
    <div style={styles.row} key={name}>
      <div style={lineStyle} />
      <div style={lineStyle}>{name}</div>
      <div style={lineStyle}>
        <SkillLights currentLevel={level} />
      </div>
    </div>
  );
}

SkillLine.propTypes = propTypes;
SkillLine.defaultProps = defaultProps;
