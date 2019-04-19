import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ApplicantConsumer } from './ApplicantContext';
import styles from './ApplicantStyles';
import AsceeImg from '../images/ascee_logo.png';

const propTypes = {
  onSubmit: PropTypes.func,
};

const defaultProps = {};

export default class ApplicantHeader extends Component {
  applicationStatus() {
    return (
      <ApplicantConsumer>
        {({ has_application }) => {
          return (
            <div style={{ ...styles.padded, ...styles.heading }}>
              {has_application
                ? 'Application not completed'
                : 'Application not started'}
            </div>
          );
        }}
      </ApplicantConsumer>
    );
  }

  render() {
    return (
      <ApplicantConsumer>
        {({ has_application, ready }) => {
          let buttonLabel = 'Start';
          let buttonStyle;
          let buttonTip;
          if (has_application) {
            buttonLabel = 'Submit';
          }
          if (has_application && ready) {
            buttonStyle = { ...styles.submit, ...styles.padded };
            buttonTip = 'Ready to submit';
          } else {
            buttonStyle = { ...styles.disabledButton, ...styles.padded };
            buttonTip = 'All fields not complete';
          }
          return [
            <div style={styles.header}>
              <h1 style={styles.h1}>
                <img src={AsceeImg} style={styles.logo} alt="Ascendance" />
                Applying to Ascendance
              </h1>
            </div>,
            has_application && (
              <div style={styles.paddedHeavily}>
                Start with your alts, add them all. Once that's done, move on to
                the questions.
              </div>
            ),
            <div>
              <button
                style={buttonStyle}
                onClick={this.props.onSubmit}
                data-tip={buttonTip}
              >
                {buttonLabel} Application
              </button>
              {!ready && this.applicationStatus()}
            </div>,
          ];
        }}
      </ApplicantConsumer>
    );
  }
}

ApplicantHeader.propTypes = propTypes;
ApplicantHeader.defaultProps = defaultProps;