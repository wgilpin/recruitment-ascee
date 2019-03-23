import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip'

import ClaimIcon from 'react-ionicons/lib/MdStarOutline';
import ApprovedIcon from 'react-ionicons/lib/MdCheckmark';
import RejectIcon from 'react-ionicons/lib/MdClose';
import DropIcon from 'react-ionicons/lib/MdArrowDown';

const statuses = {
  unclaimed: 'new',
  approved: 'approved',
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
 *  style
 */
export default class RecruitButtonBar extends Component {
  constructor(props) {
    super(props);
    const { status } = this.props;
    this.state = {
      showClaim: status === statuses.unclaimed,
      showApprove: status === statuses.claimed,
      showReject: status === statuses.approved || status === statuses.claimed,
      showDrop: status === statuses.claimed,
    };
  }

  handleClaim = () => {
    if (this.props.onClaim){
      ReactTooltip.hide()
      this.props.onClaim(this.props.id);
    }
  }

  handleReject = () => {
    if (this.props.onReject){
      this.props.onReject(this.props.id);
    }
  }

  handleApprove = () => {
    if (this.props.onApprove){
      this.props.onApprove(this.props.id);
    }
  }

  handleDrop = () => {
    if (this.props.onDrop){
      ReactTooltip.hide()
      this.props.onDrop(this.props.id);
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
        {this.state.showApprove &&
          this.showButton(<ApprovedIcon style={styles.image} onClick={this.handleApprove}/>, 'Accept')}
        {this.state.showDrop &&
          this.showButton(<DropIcon style={styles.image} onClick={this.handleDrop}/>, 'Drop')}
        {this.state.showReject &&
          this.showButton(<RejectIcon style={styles.image} onClick={this.handleReject}/>, 'Reject')}
        <ReactTooltip />
      </span>
    );
  }
}
