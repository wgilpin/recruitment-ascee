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

  arrayToObject = (arr, keyField) =>
    Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })));

  getHistory() {
    if (this.props.applicantId) {
      new FetchData({
        id: this.props.applicantId,
        scope: 'recruits/application_history',
      })
        .get()
        .then(data =>
          // add id to each entry
          this.setState({
            applications: this.arrayToObject(
              Object.entries(data.info).map(([key, val]) => ({
                ...val,
                id: key,
              })),
              'id'
            ),
          })
        );
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

  sortApps(recentFirst) {
    const direction = recentFirst ? 1 : -1;
    return (a, b) =>{
      if (!a.notes || !b.notes || a.notes.length===0 || b.notes.length===0) {
        return 0;
      }
      return direction * moment((b.notes)[b.notes.length - 1].timestamp) -
        direction * moment((a.notes)[a.notes.length - 1].timestamp);}
  }

  sortNotes(recentFirst) {
    const direction = recentFirst ? 1 : -1;
    return (a, b) =>
      direction * moment(b.timestamp) -
      direction * moment(a.timestamp);
  }

  showHistory = application => {
    if (this.props.onShowHistory) {
      this.props.onShowHistory(application);
    }
  };

  renderOldApplication(application, finalNote) {
    return (
      <div style={styles.appDetail}>
        <div style={styles.appTimestamp}>
          {moment(finalNote.timestamp).calendar()}
        </div>
        <div style={styles.appStatus}>
          {application.status}
          <img
            src={LaunchImg}
            style={{ marginLeft: '6px' }}
            onClick={() => this.showHistory(application)}
            alt="open"
          />
        </div>
        <div style={styles.assRecruiter}>{application.recruiter_name}</div>
        <div style={styles.appNote}>
          {(finalNote || {}).text}
        </div>
        <hr />
      </div>
    );
  }

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
              .sort(this.sortApps())
              .map(app => {
                if (parseInt(app.id) === applicationId && !this.props.showall) {
                  // skip the current if we're not showing all
                  return null;
                }
                const note = app.notes.sort(this.sortNotes(true)).filter(it => !it.title)[0] || {};
                return this.renderOldApplication(app, note)
              })}
          </div>
        )}
      </React.Fragment>
    );
  }
}

ApplicationHistory.propTypes = propTypes;
ApplicationHistory.defaultProps = defaultProps;
