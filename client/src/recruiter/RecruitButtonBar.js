import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip'

import ClaimIcon from 'react-ionicons/lib/MdStarOutline';
import DropIcon from 'react-ionicons/lib/MdUndo';
import EscalateIcon from 'react-ionicons/lib/IosAlertOutline';
import RejectIcon from 'react-ionicons/lib/IosTrashOutline';

const statuses = {
  unclaimed: 'new',
  escalated: 'escalated',
  claimed: 'claimed',
  accepted: 'accepted',
  rejected: 'rejected',
};

const styles = {
  bar: {
    padding: '6px',
  },
  buttonOuter: {
    width: '48px',
    height: '32px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  image: {
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    fill: 'lightgrey',
    border: '1px solid #333',
    borderRadius: '3px',
  },
};

/*
 * Props:
 *  id
 *  status
 *  onClaim(id)
 *  onEscalate(id)
 *  onDrop(id)
 *  style
 */
export default class RecruitButtonBar extends Component {
  constructor(props) {
    super(props);
    const { status } = this.props;
    this.state = {
      showClaim: status === statuses.unclaimed,
      showEscalate: status === statuses.claimed,
      showDrop: status === statuses.escalated || status === statuses.claimed,
      showReject: status !== statuses.rejected && status !== statuses.unclaimed,
    };
  }

  handleClaim = () => {
    if (this.props.onClaim){
      this.props.onClaim(this.props.id);
    }
  }

  handleDrop = () => {
    if (this.props.onDrop){
      this.props.onDrop(this.props.id);
    }
  }

  handleEscalate = () => {
    console.log('escalate')
    if (this.props.onEscalate){
      this.props.onEscalate(this.props.id);
    }
  }

  handeReject = () => {
    console.log('reject')
    if (this.props.onEscalate){
      this.props.onEscalate(this.props.id);
    }
  }

  showButton(icon, tip) {
    return <span data-tip={tip} style={styles.buttonOuter}>{icon}</span>;
  }

  render() {
    return (
      <span style={{ ...this.props.style, ...styles.bar }}>
        {this.state.showClaim &&
          this.showButton(<ClaimIcon style={styles.image} onClick={this.handleClaim}/>, 'Claim')}
        {this.state.showEscalate &&
          this.showButton(<EscalateIcon style={styles.image} onClick={this.handleEscalate}/>, 'Escalate')}
        {this.state.showDrop &&
          this.showButton(<DropIcon style={styles.image} onClick={this.handleDrop}/>, 'Drop')}
        {this.state.showReject &&
          this.showButton(<RejectIcon style={styles.image} onClick={this.handleReject}/>, 'Reject')}
        <ReactTooltip />
      </span>
    );
  }
}
