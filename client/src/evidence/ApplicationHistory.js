import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import FetchData from '../common/FetchData';
import Styles from '../common/Styles';

const propTypes = {
  applicantId: PropTypes.number,
};

const defaultProps = {};

const styles = {
  alertButton: {
    ...Styles.styles.primaryButton,
    color: 'white',
    border: 'white',
    backgroundColor: 'red',
  },
  appDetail: {},
  appNote: {
    paddingLeft: '6px',
    marginBottom: '9px',
  },
  appTimestamp: {
    fontSize: 'small',
    fontWeight: 500,
  },
  appStatus: {
    color: 'orange',
  },
  appRecruiter: {
    fontWeight: 500,
  },
};
export default class ApplicationHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      applications: {},
      showOldApps: false,
    };
  }

  componentDidMount() {
    new FetchData({
      id: this.props.applicantId,
      scope: 'recruits/application_history',
    })
      .get()
      .then(data => this.setState({ applications: data.info }));
  }

  handleClickShow = () =>
    this.setState({ showOldApps: !this.state.showOldApps });

  sortApps(a, b) {
    return (
      moment((b.notes || {})[0].timestamp) -
      moment((a.notes || {})[0].timestamp)
    )
  }

  render() {
    const { applicationId } = this.props;
    const { applications, showOldApps } = this.state;
    if (!applicationId || !Object.keys(applications).length) {
      return null;
    }
    const hasOldApps = Object.keys(applications).length > 1;
    console.log('found', hasOldApps);

    return (
      <React.Fragment>
        {hasOldApps && (
          <button style={styles.alertButton} onClick={this.handleClickShow}>
            Old Applications
          </button>
        )}
        {showOldApps && (
          <div style={styles.appsList}>
            {Object.values(applications)
              .sort(this.sortApps)
              .map(val => {
                const note = val.notes[0] || {};
                return (
                  <div style={styles.appDetail}>
                    <div style={styles.appTimestamp}>
                      {moment(note.timestamp).calendar()}
                    </div>
                    <div style={styles.appStatus}>{val.status}</div>
                    <div style={styles.assRecruiter}>{val.recruiter_name}</div>
                    <div style={styles.appNote}>
                      {(val.notes[0] || {}).text}
                    </div>
                    <hr/>
                  </div>
                );
              })}
          </div>
        )}
      </React.Fragment>
    );
  }
}

ApplicationHistory.propTypes = propTypes;
ApplicationHistory.defaultProps = defaultProps;
