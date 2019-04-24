import React from 'react';
import TableStyles from '../evidence/TableStyles';
import Misc from '../common/Misc';
import RecruitItem from './RecruitItem';
import collapsedImg from '../images/collapsed.png';
import expandedImg from '../images/expanded.png';
import { RecruiterConsumer } from './RecruiterContext';

const localStyles = {
  h2: {
    ...TableStyles.styles.headerText,
    textAlign: 'left',
    fontSize: 'larger',
    paddingLeft: '12px',
    marginTop: '16px',
    height: '36px',
  },
  noneText: {
    textAlign: 'left',
    paddingLeft: '26px',
    paddingBottom: '16px',
    marginTop: '12px',
  },
  section: {
    backgroundColor: '#333',
    marginBottom: '16px',
    animation: 'fadein 2s',
  },
  collapse: {
    float: 'right',
    margin: '8px',
    height: '20px',
    cursor: 'pointer',
  },
};

export default class SectionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
    };
    this.roles = {};
  }

  handleExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  sortMine = (a, b) => {
    const aMine =
      this.props.list[a].recruiter_id === this.roles.user_id ? 1 : 0;
    const bMine =
      this.props.list[b].recruiter_id === this.roles.user_id ? 1 : 0;
    return bMine - aMine;
  };

  render() {
    const {
      label,
      list,
      isEnabled,
      onSelect,
      onClaim,
      onApprove,
      onDrop,
      onReject,
      onMail,
    } = this.props;
    const { expanded } = this.state;
    return (
      <RecruiterConsumer>
        {roles => {
          this.roles = roles;
          return (
            <div style={localStyles.section}>
              <img
                style={localStyles.collapse}
                src={expanded ? expandedImg : collapsedImg}
                alt=""
                onClick={this.handleExpand}
              />
              <div style={localStyles.h2}>{label}</div>
              {this.state.expanded &&
                (Misc.dictLen(list) > 0 ? (
                  Object.keys(list)
                    .sort(this.sortMine)
                    .map(key => (
                      <RecruitItem
                        id={key}
                        recruit={list[key]}
                        isEnabled={isEnabled}
                        onSelect={this.props.onSelect}
                        onClaim={this.props.onClaim}
                        onApprove={this.props.onApprove}
                        onDrop={this.props.onDrop}
                        onReject={this.props.onReject}
                        onMail={this.props.onMail}
                      />
                    ))
                ) : (
                  <div style={localStyles.noneText}>None</div>
                ))}
            </div>
          );
        }}
      </RecruiterConsumer>
    );
  }
}
