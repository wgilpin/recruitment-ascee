import React from 'reactn';
import Loader from 'react-loader-spinner';
import FetchData from '../common/FetchData';
import Evidence from '../evidence/Evidence';
import BackImg from '../images/back.png';
import IconBtn from '../common/IconBtn';
import TableStyles from '../evidence/TableStyles';
import styles from '../Applicant/ApplicantStyles';
import Alert from '../common/Alert';
import Confirm from '../common/Confirm';
import SectionList from './SectionList';
import { RecruiterProvider } from './RecruiterContext';
import Search from './Search';


const localStyles = {
  ...styles,
  ...TableStyles.styles,
  outer: {
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  
  recruitButton: {
    marginLeft: '12px',
    padding: '6px',
    backgroundColor: 'black',
    color: 'darkgrey',
    borderColor: 'grey',
    position: 'absolute',
    left: '350px',
    marginTop: '8px',
  },

  find: {
    margin: '12px',
  },
};

export default class Recruiter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      activeRecruitId: null,
      recruits: {},
      roles: {
        is_recruiter: false,
        is_senior_recruiter: false,
        is_admin: false,
      },
      showAlert: false,
      showConfirm: false,
      showHistory: false,
      historyId: null,
    };
  }

  static statuses = {
    unclaimed: 'new',
    claimed: 'claimed',
    accepted: 'accepted',
    rejected: 'rejected',
  };

  componentDidMount = () => {
    // Hydrate the  state with the response from /api/recruits
    // api recruits returns 3 lists:
    //   claimed: my recruits to process
    //   accepted: recruits I claimed then accepted
    //   unclaimed: all unclaimed
    new FetchData({ id: this.state.id, scope: 'applicant_list' })
      .get()
      // Set the state `recruits` list, and set no recruit selected
      .then(recruits =>
        this.setState({ recruits: recruits.info, activeRecruitId: null })
      )
      .then(() => {
        return new FetchData({ scope: 'user/roles' }).get().then(roles => {
          return this.setState({ roles: roles.info, loading: false });
        });
      })
      .catch(err => {
        console.log('mounting error');
        return { error: err };
      });
  };

  setRecruitStatus(id, status) {
    this.setState({
      recruits: {
        ...this.state.recruits,
        [id]: {
          ...this.state.recruits[id],
          status: status,
        },
      },
    });
  }

  handleAccept = id => {
    const status = this.state.recruits[id].status;
    if (
      status === Recruiter.statuses.claimed &&
      this.state.roles.is_recruiter
    ) {
      // I can accept
      new FetchData({ id, scope: 'recruits/accept' })
        .get()
        .then(this.componentDidMount);
    }
  };

  handleMail = id => {
    const status = this.state.recruits[id].status;
    if (
      status === Recruiter.statuses.accepted &&
      this.state.roles.is_senior_recruiter
    ) {
      // I can invite
      new FetchData({ id, scope: 'recruits/invite' })
        .get()
        .then(this.componentDidMount);
    } else {
      this.setState({
        showAlert: true,
        alertText: "You don't have permission to invite",
      });
    }
  };

  handleClaim = id => {
    new FetchData({ id, scope: 'recruits/claim' }).get().then(res => {
      if (res.status === 'ok') {
        this.setRecruitStatus(id, Recruiter.statuses.claimed);
      } else {
        this.setState({ showAlert: true, alertText: "User can't be claimed" });
      }
    });
  };

  handleDrop = id => {
    new FetchData({ id, scope: 'recruits/release' }).get().then(res => {
      if (res.status === 'ok') {
        this.setRecruitStatus(id, Recruiter.statuses.unclaimed);
      } else if (res.status === 406) {
        alert('User has not completed their application');
      } else {
        this.setState({ showAlert: true, alertText: "User can't be dropped" });
      }
    });
  };

  handleReject = id => {
    this.setState({
      showConfirm: true,
      currentApplicant: id,
      confirmText: `Reject ${this.state.recruits[id].name}`,
    });
  };

  doReject = () => {
    const id = this.state.currentApplicant;
    this.setState({ showConfirm: false });
    new FetchData({ id, scope: 'recruits/reject' }).get().then(res => {
      if (res.status === 'ok') {
        this.setRecruitStatus(id, Recruiter.statuses.rejected);
      } else {
        this.setState({
          showAlert: true,
          alertText:
            "User can't be rejected. \nCheck with an admin that a evemail \nsender is configured",
        });
      }
    });
  };

  handleClick = (id) => {
    if (this.state.recruits[id].status !== Recruiter.statuses.unclaimed)
      this.setState({ activeRecruitId: id });
  }

  applyFilter(status) {
    const res = {};
    Object.keys(this.state.recruits || {})
      .filter(key => this.state.recruits[key].status === status)
      .forEach(key => {
        res[key] = this.state.recruits[key];
      });
    return res;
  }

  handleBack = () => {
    this.setState({ activeRecruitId: null });
  };

  closeAlert = () => {
    this.setState({ showAlert: false });
  };

  handleOpenFromSearch = (id, _, name) => {
    this.setState({
      showHistory: id !== null,
      historyId: id,
    });
  };

  renderList = () => {
    // 3 sections in order: claimed, accepted, unclaimed.
    const claimed = this.applyFilter(Recruiter.statuses.claimed);
    const unclaimed = this.applyFilter(Recruiter.statuses.unclaimed);
    const accepted = this.applyFilter(Recruiter.statuses.accepted);
    
    return (
      <div style={localStyles.outer}>
        <h1 style={localStyles.headerText}>Applications Pending</h1>
        <div style={localStyles.logout}>
          <a href="/auth/logout">
            <button style={styles.secondaryButton}>Sign Out</button>
          </a>
        </div>
        <div style={localStyles.claimed}>
          <RecruiterProvider value={this.state.roles}>
            <SectionList
              label="Claimed"
              list={claimed}
              isEnabled={this.state.roles.is_recruiter}
              onSelect={this.handleClick}
              onClaim={this.handleClaim}
              onApprove={this.handleAccept}
              onDrop={this.handleDrop}
              onReject={this.handleReject}
              onMail={this.handleMail}
            />
          </RecruiterProvider>
        </div>
        <div style={localStyles.accepted}>
          <RecruiterProvider value={this.state.roles}>
            <SectionList
              label="Accepted"
              list={accepted}
              isEnabled={this.state.roles.is_senior_recruiter}
              onSelect={this.handleClick}
              onClaim={this.handleClaim}
              onApprove={this.handleAccept}
              onDrop={this.handleDrop}
              onReject={this.handleReject}
              onMail={this.handleMail}
            />
          </RecruiterProvider>
        </div>
        <div style={localStyles.unclaimed}>
          <RecruiterProvider value={this.state.roles}>
            <SectionList
              label="Unclaimed"
              list={unclaimed}
              isEnabled={this.state.roles.is_recruiter}
              onSelect={this.handleClick}  
              onClaim={this.handleClaim}
              onApprove={this.handleAccept}
              onDrop={this.handleDrop}
              onReject={this.handleReject}
              onMail={this.handleMail}         
            />
          </RecruiterProvider>
        </div>
        {this.state.roles.is_senior_recruiter && 
          <Search id={this.state.historyId} onChoose={this.handleOpenFromSearch}/>
        }
      </div>
    );
  };

  renderEvidence = () => {
    const activeRecruit = this.state.recruits[this.state.activeRecruitId];
    return [
      <IconBtn
        src={BackImg}
        alt="back"
        label="Back"
        onClick={this.handleBack}
        style={{ border: 'none' }}
      />,
      <Evidence
        style={localStyles.evidence}
        main={this.state.activeRecruitId}
        recruiterName={activeRecruit.recruiter_name}
        showRecruiter={
          activeRecruit.recruiter_id !== this.state.roles.user_id
            ? activeRecruit.recruiter_id
            : null
        }
      />,
    ];
  };

  render() {
    const { roles, recruits, activeRecruitId, loading } = this.state;
    if (loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    if (
      !(
        loading ||
        roles.is_admin ||
        roles.is_recruiter ||
        roles.is_senior_recruiter
      )
    ) {
      // no roles? wrong place
      window.location = '/';
    }
    const activeRecruit = activeRecruitId && recruits[activeRecruitId];
    return [
      roles.is_admin && (
        <a href="/app/admin">
          <button style={{ ...localStyles.primaryButton, float: 'right' }}>
            Admin
          </button>
        </a>
      ),
      !activeRecruitId && this.renderList(),
      activeRecruitId &&
        activeRecruit.status !== Recruiter.statuses.unclaimed &&
        this.renderEvidence(),
      this.state.showAlert && (
        <Alert text={this.state.alertText} onClose={this.closeAlert} />
      ),
      this.state.showConfirm && (
        <Confirm
          text={this.state.confirmText}
          onClose={() => this.setState({ showConfirm: false })}
          onConfirm={this.doReject}
        />
      ),
    ];
  }
}
