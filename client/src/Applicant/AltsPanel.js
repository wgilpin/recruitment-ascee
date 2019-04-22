import React from 'react';
import PropTypes from 'prop-types';
import Alts from '../evidence/Alts';
import FabButton from '../common/fabButton';
import styles from './ApplicantStyles';
import ReactTooltip from 'react-tooltip';
import { ApplicantConsumer } from './ApplicantContext';

const propTypes = {};

const defaultProps = {};

export default function AltsPanel(props) {
  return (
    <ApplicantConsumer>
      {({ altsDone, ready }) => (
        <React.Fragment>
          <h2 style={styles.headingLeft}>My Alts</h2>
          <div
            style={styles.padded}
            data-tip="Check here when you have added all you alts"
          >
            <label style={styles.label}>
              I have no more alts&emsp;
              <input
                style={styles.checkbox}
                type="checkbox"
                onClick={props.onAltsDone}
                checked={altsDone}
              />
            </label>
          </div>
          <Alts>
            <a href="/auth/link_alt" data-tip="Add an alt">
              {!ready && (
                <FabButton
                  icon="add"
                  color={styles.themeColors.primary}
                  size="40px"
                />
              )}
            </a>
          </Alts>
          <ReactTooltip />
        </React.Fragment>
      )}
    </ApplicantConsumer>
  );
}

AltsPanel.propTypes = propTypes;
AltsPanel.defaultProps = defaultProps;
