import React from 'react';
import TableStyles from '../evidence/TableStyles';
import Misc from '../common/Misc';
import RecruitItem from './RecruitItem';

const localStyles = {
  h2: {
    ...TableStyles.styles.headerText,
    textAlign: 'left',
    fontSize: 'larger',
    paddingLeft: '12px',
    marginTop: '16px',
  },
  noneText: {
    textAlign: 'left',
    paddingLeft: '26px',
    paddingBottom: '16px',
    marginTop: '12px',
  },
  section: {
    backgroundColor: '#333',
  },
};

export default ({ label, list, isEnabled, onSelect }) => {
  return (
    <div style={localStyles.section}>
      <div style={localStyles.h2}>{label}</div>
      {Misc.dictLen(list) > 0 ? (
        Object.keys(list).map(key => (
          <RecruitItem id={key} recruit={list[key]} isEnabled={isEnabled} onSelect={onSelect}/>
        ))
      ) : (
        <div style={localStyles.noneText}>None</div>
      )}
    </div>
  );
};
