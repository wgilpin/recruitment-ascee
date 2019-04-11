import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import FetchData from '../common/FetchData';
import Styles from '../common/Styles';
import LaunchImg from '../images/launch_white_18dp.png';

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

  getHistory() {
    if (this.props.applicantId) {
      new FetchData({
        id: this.props.applicantId,
        scope: 'recruits/application_history',
      })
        .get()
        .then(data => this.setState({ applications: data.info }));
    } else {
      this.setState({ applications: {} });
    }
  }

  componentDidMount() {
    this.getHistory();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.applicantId !== this.props.applicantId) {
      this.getHistory();
    }
  }

  handleClickShow = () =>
    this.setState({ showOldApps: !this.state.showOldApps });

  sortApps(a, b) {
    return (
      moment((b.notes || {})[0].timestamp) -
      moment((a.notes || {})[0].timestamp)
    );
  }

  showHistory = application => {
    if (this.props.onShowHistory) {
      this.props.onShowHistory(application);
    }
  };

  render() {
    const { applicationId } = this.props;
    const min_history = this.props.showall ? 0 : 1;
    const { applications, showOldApps } = this.state;
    if (!applicationId && Object.keys(applications).length === 0) {
      return null;
    }
    const hasOldApps = Object.keys(applications).length > min_history;

    return (
      <React.Fragment>
        {hasOldApps && !this.props.showall && (
          <button style={styles.alertButton} onClick={this.handleClickShow}>
            Old Applications
          </button>
        )}
        {(showOldApps || this.props.showall) && (
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
                    <div style={styles.appStatus}>
                      {val.status}
                      <img
                        src={LaunchImg}
                        style={{ marginLeft: '6px' }}
                        onClick={() => this.showHistory(val)}
                        alt="open"
                      />
                    </div>
                    <div style={styles.assRecruiter}>{val.recruiter_name}</div>
                    <div style={styles.appNote}>
                      {(val.notes[0] || {}).text}
                    </div>
                    <hr />
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
