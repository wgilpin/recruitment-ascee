import React from 'react';
import PropTypes from 'prop-types';

const sqStates = {
  injected: 0,
  queued: 1,
  trained: 2,
}

const sqPropTypes = {
  state: PropTypes.string,
};

const sqDefaultProps = {
  state: sqStates.injected,
};


const styles = {
  square: {
    display: 'flex',
    width: '12px',
    height: '12px',
    // margin: '1px',
    strokeWidth:1,
    stroke: '#999999',
  },
  sqTrained:{
    stroke: '#999999',
    fill: '#999999',
  },
  sqQueued: {
    stroke: '#05313E',
    fill: '#01799A',
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
    height: '14px',
    borderColor: '#999999',
    backgroundColor: 'black',
    paddingLeft: '2px',
    paddingRight: '2px',
    paddingBottom: '2px',
    paddingTop: '1px',
    width: 13*5,

  },
  both: {
    borderStyle: 'solid',
    borderWidth: '1px',
    // margin: '1px',
  },
}

class SkillSquare extends React.Component {

  render() {
    let style = styles.square;
    style = {
      ...styles.square,
      ...(this.props.state === sqStates.trained ? styles.sqTrained : {} ),
      ...(this.props.state === sqStates.queued ? styles.sqQueued : {} ),
    }
    return (
      <svg width={14} height={styles.square.height} style={{margin:'1px'}}>
        <rect
          width={styles.square.width}
          height={styles.square.height}
          rx={1} ry={1}
          fill={style.fill}
          stroke={style.stroke}
          style={style} />
      </svg>
    );
  }
}

SkillSquare.propTypes = sqPropTypes;
SkillSquare.defaultProps = sqDefaultProps;

///////////////////////////////////////////

const propTypes = {};

const defaultProps = {
  currentLevel: 0,
  trainLevel: 0};

export default class SkillLights extends React.Component {

  render() {
    let { currentLevel, trainLevel} = this.props;
    let states = [];
    for (let i in [1,2,3,4,5]){
      if (i <= currentLevel){
        states.push(sqStates.trained);
      } else if (i <= trainLevel){
        states.push(sqStates.queued);
      } else {
        states.push(sqStates.injected);
      }
    }

    return (
      <div style={{...styles.both, ...styles.line}}>
        {states.map(sqState=>{ return (<SkillSquare state={sqState}/>) })}
      </div>
    );
  }
}

SkillLights.propTypes = propTypes;
SkillLights.defaultProps = defaultProps;