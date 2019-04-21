import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from '../evidence/TableStyles';
import Recruiter from './Recruiter';
import ClaimedMineIcon from 'react-ionicons/lib/MdStar';
import ClaimedOtherIcon from 'react-ionicons/lib/MdStarOutline';
import ApproveIcon from 'react-ionicons/lib/MdCheckboxOutline';
import ApproveIconMine from 'react-ionicons/lib/MdCheckbox';
import RoundImage from '../common/RoundImage';
import RecruitButtonBar from './RecruitButtonBar';
import {RecruiterConsumer} from './RecruiterContext';

const propTypes = {
  id: PropTypes.number,
  recruit: PropTypes.object,
  isEnabled: PropTypes.bool,
  onSelect: PropTypes.func,
};

const defaultProps = {};

const localStyles = {
  icon: {
    marginRight: '32px',
    height: '32px',
    width: '32px',
    fill: TableStyles.styles.themeColor.color,
  },
  recruit: {
    justifyItems: 'left',
    textAlign: 'left',
    padding: '12px',
    position: 'relative',
  },
  buttons: {
    position: 'absolute',
    left: '400px',
  },
  name: {
    fontWeight: 500,
    verticalAlign: 'super',
    paddingLeft: '12px',
    cursor: 'pointer',
  },
};

export default class RecruitItem extends React.Component {
  render() {
    const { id, recruit, isEnabled } = this.props;

    const avatarImg = `https://image.eveonline.com/Character/${id}_64.jpg`;
    const recruitIsClaimed = recruit.status === Recruiter.statuses.claimed;
    const recruitIsAccepted = recruit.status === Recruiter.statuses.accepted;
    return (
      <RecruiterConsumer>
      {roles => {
          const recruitIsMine = recruit.recruiter_id === roles.user_id;
          return (
            <div key={id} style={localStyles.recruit}>
              {[
                recruitIsClaimed &&
                  (recruitIsMine ? (
                    <ClaimedMineIcon style={localStyles.icon} fontSize="24px" />
                  ) : (
                    <ClaimedOtherIcon
                      style={localStyles.icon}
                      fontSize="24px"
                    />
                  )),
                recruitIsAccepted &&
                  (recruitIsMine ? (
                    <ApproveIconMine style={localStyles.icon} fontSize="24px" />
                  ) : (
                    <ApproveIcon style={localStyles.icon} fontSize="24px" />
                  )),
              ]}
              <span
                onClick={() => this.props.onSelect(id)}
                style={localStyles.altSpan}
              >
                <RoundImage src={avatarImg} />
                <span style={localStyles.name}>{recruit.name}</span>
              </span>
              <RecruitButtonBar
                status={recruit.status}
                style={localStyles.buttons}
                id={id}
                onClaim={isEnabled && this.handleClaim}
                onReject={isEnabled && this.handleReject}
                onDrop={isEnabled && this.handleDrop}
                onApprove={isEnabled && this.handleAccept}
                onMail={isEnabled && this.handleMail}
              />
            </div>
          );
        }}
      </RecruiterConsumer>
    );
  }
}

RecruitItem.propTypes = propTypes;
RecruitItem.defaultProps = defaultProps;
