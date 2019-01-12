import React, { Component } from 'react';

import ClaimIcon from 'react-ionicons/lib/MdStarOutline';
import DropIcon from 'react-ionicons/lib/MdUndo';
import EscalateIcon from 'react-ionicons/lib/IosAlertOutline';

const statuses = {
  unclaimed: 0,
  escalated: 1,
  claimed: 2,
  accepted: 3,
  rejected: 4,
  ignore: 5,
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

  showButton(icon) {
    return <span style={styles.buttonOuter}>{icon}</span>;
  }

  render() {
    return (
      <span style={{ ...this.props.style, ...styles.bar }}>
        {this.state.showClaim &&
          this.showButton(<ClaimIcon style={styles.image} onClick={this.handleClaim}/>)}
        {this.state.showEscalate &&
          this.showButton(<EscalateIcon style={styles.image} onClick={this.handleEscalate}/>)}
        {this.state.showDrop &&
          this.showButton(<DropIcon style={styles.image} onClick={this.handleDrop}/>)}
      </span>
    );
  }
}
