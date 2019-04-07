import React from 'reactn';
import Loader from 'react-loader-spinner';
import FetchData from '../common/FetchData';
import ClaimedMineIcon from 'react-ionicons/lib/MdStar';
import ClaimedOtherIcon from 'react-ionicons/lib/MdStarOutline';
import ApproveIcon from 'react-ionicons/lib/MdCheckboxOutline';
import ApproveIconMine from 'react-ionicons/lib/MdCheckbox';
import Evidence from '../evidence/Evidence';
import Misc from '../common/Misc';
import RoundImage from '../common/RoundImage';
import BackImg from '../images/back.png';
import OpenImg from '../images/arrow_forward.png';
import RecruitButtonBar from './RecruitButtonBar';
import IconBtn from '../common/IconBtn';
import TableStyles from '../evidence/TableStyles';
import styles from '../Applicant/ApplicantStyles';
import Alert from '../common/Alert';
import Confirm from '../common/Confirm';
import FindESICharacter from '../admin/FindESICharacter';
import ApplicationHistory from '../evidence/ApplicationHistory';

const localStyles = {
  ...styles,
  ...TableStyles.styles,
  outer: {
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  h2: {
    ...TableStyles.styles.headerText,
    textAlign: 'left',
    fontSize: 'larger',
    paddingLeft: '12px',
    marginTop: '16px',
  },
  noneText: {
    textAlign: 'left',
    paddingLeft: '26px',
    paddingBottom: '16px',
    marginTop: '12px',
  },
  grid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: '1fr 1fr 1fr',
    gridColumnGap: '20px',
    gridRowGap: '10px',
    margin: 'auto',
    justifyItems: 'left',
    textAlign: 'left',
  },
  name: {
    fontWeight: 500,
    verticalAlign: 'super',
    paddingLeft: '12px',
    cursor: 'pointer',
  },
  claimed: {
    gridColumn: 1,
    gridRow: 1,
  },
  accepted: {
    gridColumn: 1,
    gridRow: 2,
  },
  unclaimed: {
    gridColumn: 1,
    gridRow: 3,
  },
  search: {
    marginTop: '20px',
  },
  evidence: {
    gridColumn: 2,
    gridRow: '1/3',
  },
  recruit: {
    justifyItems: 'left',
    textAlign: 'left',
    padding: '12px',
    position: 'relative',
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
  icon: {
    marginRight: '32px',
    height: '32px',
    width: '32px',
    fill: TableStyles.styles.themeColor.color,
  },
  section: {
    backgroundColor: '#333',
  },
  buttons: {
    position: 'absolute',
    left: '400px',
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
    console.log(`handleAccept ${id}`);
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
    console.log(`handleMail ${id}`);
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
    console.log(`handleClaim ${id}`);
    new FetchData({ id, scope: 'recruits/claim' }).get().then(res => {
      if (res.status === 'ok') {
        this.setRecruitStatus(id, Recruiter.statuses.claimed);
      } else {
        this.setState({ showAlert: true, alertText: "User can't be claimed" });
      }
    });
  };

  handleDrop = id => {
    console.log(`handleDrop ${id}`);
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
    console.log(`doReject ${id}`);
    this.setState({ showConfirm: false });
    new FetchData({ id, scope: 'recruits/reject' }).get().then(res => {
      if (res.status === 'ok') {
        this.setRecruitStatus(id, Recruiter.statuses.rejected);
      } else {
        this.setState({ showAlert: true, alertText: "User can't be rejected. \nCheck with an dmain that a evemail \nsender is configured" });
      }
    });
  };

  handleClick(id) {
    console.log(`activate recruit ${id}`);
    if (this.state.recruits[id].status !== Recruiter.statuses.unclaimed)
      this.setState({ activeRecruitId: id });
  }

  recruitLine(id, recruit, isEnabled) {
    const avatarImg = `https://image.eveonline.com/Character/${id}_64.jpg`;
    const recruitIsMine = recruit.recruiter_id === this.state.roles.user_id;
    const recruitIsClaimed = recruit.status === Recruiter.statuses.claimed;
    const recruitIsAccepted = recruit.status === Recruiter.statuses.accepted;
    return (
      <div key={id} style={localStyles.recruit}>
        {[
          recruitIsClaimed &&
            (recruitIsMine ? (
              <ClaimedMineIcon style={localStyles.icon} fontSize="24px" />
            ) : (
              <ClaimedOtherIcon style={localStyles.icon} fontSize="24px" />
            )),
          recruitIsAccepted &&
            (recruitIsMine ? (
              <ApproveIconMine style={localStyles.icon} fontSize="24px" />
            ) : (
              <ApproveIcon style={localStyles.icon} fontSize="24px" />
            )),
        ]}
        <span onClick={() => this.handleClick(id)} style={localStyles.altSpan}>
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
  }

  sectionList(label, list, isEnabled) {
    return (
      <div style={localStyles.section}>
        <div style={localStyles.h2}>{label}</div>
        {Misc.dictLen(list) > 0 ? (
          Object.keys(list).map(key =>
            this.recruitLine(key, list[key], isEnabled)
          )
        ) : (
          <div style={localStyles.noneText}>None</div>
        )}
      </div>
    );
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
          {this.sectionList('Claimed', claimed, this.state.roles.is_recruiter)}
        </div>
        <div style={localStyles.accepted}>
          {this.sectionList(
            'Accepted',
            accepted,
            this.state.roles.is_senior_recruiter
          )}
        </div>
        <div style={localStyles.unclaimed}>
          {this.sectionList(
            'Unclaimed',
            unclaimed,
            this.state.roles.is_recruiter
          )}
        </div>
        {this.state.roles.is_senior_recruiter && (
          <div style={localStyles.search}>
            <div style={{...localStyles.section, padding: '12px'}}>
              <ApplicationHistory applicantId={this.state.historyId} showall/>
              <div>
                <FindESICharacter
                  onChange={this.handleOpenFromSearch}
                  iconList={[{ name: 'open', img: OpenImg }]}
                />
              </div>
            </div>
          </div>
        )}
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
    if (this.state.loading) {
      console.log('loading');
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    if (
      !(
        this.state.loading ||
        this.state.roles.is_admin ||
        this.state.roles.is_recruiter ||
        this.state.roles.is_senior_recruiter
      )
    ) {
      // no roles? wrong place
      window.location = '/';
    }
    console.log('loaded');
    const activeRecruit = this.state.recruits[this.state.activeRecruitId];
    return [
      this.state.roles.is_admin && (
        <a href="/app/admin">
          <button style={{ ...localStyles.primaryButton, float: 'right' }}>
            Admin
          </button>
        </a>
      ),
      !this.state.activeRecruitId && this.renderList(),
      this.state.activeRecruitId &&
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
