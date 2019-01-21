import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from './FetchData';
import TableStyles from './TableStyles';
import SkillLights from './SkillLights';
import collapsedImg from './images/collapsed.png';
import expandedImg from './images/expanded.png';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {
};

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
  }
}

export default class Skill extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'skill',
      skillQueue: [],
      skillList: {},
      loading: true,
    };
  }

  static jsonToskillList(json) {
    let trainLevels = {};
    let queue = [];
    if (json && json.queue) {
      for (let idx in json.queue) {
        queue.push(json.queue[idx]);
        let { finished_level, skill_id: { name } } = json.queue[idx];
        // store the level being trained to for later
        if (trainLevels[name]) {
          trainLevels[name].finish = finished_level;
        } else {
          // it only doesn't have this prop the first time
          trainLevels[name] = { start: finished_level - 1, finish: finished_level };
        }
      }
    }
    let groupedList = {};
    if (json && json.skills) {
      for (let idx in json.skills) {
        let sk = json.skills[idx];
        let group = sk.skill_id.groupName;
        if (!(group in groupedList)) {
          groupedList[group] = { items: {}, collapsed: true, summary: { spTotal: 0, count: 0 } };
        };
        groupedList[group].items[sk.skill_id.name] = sk.active_skill_level;
        groupedList[group].summary.spTotal += sk.skillpoints_in_skill;
        groupedList[group].summary.count += 1;
      }
    }
    return { queue, groupedList, trainLevels };
  }

  componentDidMount() {
    new FetchData(
      { id: this.props.alt, scope: 'skill' },
      this.onLoaded,
      this.onError
    ).get()
      .then(data => {
        let { queue, groupedList, trainLevels } = Skill.jsonToskillList(data.info);
        if (queue.length !== (this.state.skillQueue || []).length) {
          this.setState({ skillQueue: queue, trainLevels });
        };
        if (Object.keys(groupedList).length !== Object.keys(this.state.skillList || {}).length) {
          this.setState({ skillList: groupedList, loading: false });
        };
      });
  }

  skillQueueLinesShown = 0;

  skillQLine(key, { finish_date, start_date, finished_level, skill_id }) {
    let lineStyle =
      (this.skillQueueLinesShown % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    let startDate = new Date(start_date),
      endDate = new Date(finish_date),
      today = new Date(),
      fullRange = endDate - startDate,
      soFar = today - startDate;
    let { start, finish } = this.state.trainLevels[skill_id.name];
    if (finished_level !== finish) {
      return null;
    }
    this.skillQueueLinesShown += 1;
    return (
      <div style={styles.row} key={key}>
        <div style={lineStyle}>{skill_id.name}</div>
        <div style={lineStyle}>
          <SkillLights currentLevel={start - 1} trainLevel={finish} />
        </div>
        <div style={lineStyle}>{
          soFar > 0.0 ?
            <progress style={styles.progress} value={soFar} max={fullRange} /> :
            null
        }
        </div>
      </div>
    )
  }

  skillLine(idx, name, active_skill_level) {
    let lineStyle =
      (idx % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    return (
      <div style={styles.row} key={name}>
        <div style={lineStyle}></div>
        <div style={lineStyle}>{name}</div>
        <div style={lineStyle}>
          <SkillLights currentLevel={active_skill_level} />
          {/* <img src={Skill.skill2image[active_skill_level]} alt={active_skill_level}/> */}
        </div>
      </div>
    )
  }

  toggleGroup = (e) => {
    let updatedGroup = this.state.skillList[e];
    updatedGroup.collapsed = !updatedGroup.collapsed;
    this.setState({ skillList: { ...this.state.skillList } })
  }

  render() {
    if (this.state.loading) {
      return(
      <Loader 
        type="Puff"
        color="#01799A"
        height="100"	
        width="100"
      />)
    }
    this.skillQueueLinesShown = 0;
    return (
      <div style={styles.div}>
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <div style={styles.cell}>SKILL QUEUE (ROLLED UP)</div>
            <div style={styles.cell}>LEVEL</div>
            <div style={styles.cell}>PROGRESS</div>
          </div>
          {this.state.skillQueue.map((line, idx) => {
            return this.skillQLine(idx, line)
          })}
        </div>
        <br />
        <br />
        <br />
        <hr />
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <div style={styles.cell}>GROUP</div>
            <div style={styles.cell}>SKILL</div>
            <div style={styles.cell}>LVL</div>
          </div>
          {Object.keys(this.state.skillList).sort().map((groupName) => {
            let group = this.state.skillList[groupName];
            return (
              <React.Fragment>
                <div
                  style={{ ...styles.row, ...styles.folderHeader }}
                  key={groupName}
                  onClick={this.toggleGroup.bind(this, groupName)}
                >
                  <div style={styles.cell}>
                    {!group.collapsed && <img src={expandedImg} alt="+"></img>}
                    {group.collapsed && <img src={collapsedImg} alt="-"></img>}
                    {' ' + groupName.toUpperCase()} ({group.summary.count})
                  </div>
                  <div style={{ ...styles.cell, textAlign: 'right' }}>{(group.summary.spTotal.toLocaleString())} SP</div>
                  <div style={styles.cell}></div>
                </div>
                {!(group.collapsed) && Object.keys(group.items).sort().map((line, idx) => {
                  return this.skillLine(idx, line, group.items[line])
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    );
  }
}

Skill.propTypes = propTypes;
Skill.defaultProps = defaultProps;