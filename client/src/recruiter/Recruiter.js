import React from 'reactn';
import Loader from 'react-loader-spinner';
import FetchData from '../common/FetchData';
import ClaimedIcon from 'react-ionicons/lib/MdStar';
import ApproveIcon from 'react-ionicons/lib/MdCheckboxOutline';
import Evidence from '../Evidence';
import Misc from '../common/Misc';
import RoundImage from '../common/RoundImage';
import BackImg from '../images/back.png';
import RecruitButtonBar from './RecruitButtonBar';
import IconBtn from '../common/IconBtn';
import TableStyles from '../TableStyles';
import styles from '../Applicant/ApplicantStyles';

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
  approved: {
    gridColumn: 1,
    gridRow: 2,
  },
  unclaimed: {
    gridColumn: 1,
    gridRow: 3,
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
};


export default class Recruiter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      activeRecruit: null,
      recruits: {},
      roles: {
        is_recruiter: false,
        is_senior_recruiter: false,
        is_admin: false,
      }
    };
  }

  static statuses = {
    unclaimed: 'new',
    approved: 'approved',
    claimed: 'claimed',
    accepted: 'accepted',
    rejected: 'rejected',
  };

  componentDidMount() {
    // Hydrate the  state with the response from /api/recruits
    // api recruits returns 3 lists:
    //   claimed: my recruits to process
    //   approved: recruits I claimed then approved
    //   unclaimed: all unclaimed
    new FetchData({ id: this.state.id, scope: 'applicant_list' })
      .get()
      // Set the state `recruits` list, and set no recruit selected
      .then(recruits => this.setState({ recruits: recruits.info, activeRecruit: null }))
      .then(() => {
        return new FetchData({ scope: 'user/roles' })
        .get()
        .then(roles => {
          return this.setState({ roles: roles.info, loading: false });
        })
      })
      .catch(err => {
        console.log('mounting error');
        return { error: err };
      });
  }

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
    if (status  === Recruiter.statuses.claimed && this.state.roles.is_recruiter){
      // I can accept
      new FetchData({ id, scope: 'recruits/accept' }).get().then(this.componentDidMount);
    } else if (status  === Recruiter.statuses.accepted && this.state.roles.is_senior_recruiter){
      // I can invite
      new FetchData({ id, scope: 'recruits/invite' }).get().then(this.componentDidMount);
    }
  };


  handleClaim = id => {
    console.log(`handleClaim ${id}`);
    new FetchData({ id, scope: 'recruits/claim' }).get().then(res => {
      if (res.status === 'ok') {
        this.setRecruitStatus(id, Recruiter.statuses.claimed);
      } else if (res.status === 406) {
        alert('User has not completed their application');
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
      }
    });
  };


  handleReject = id => {
    console.log(`handleReject ${id}`);
    if (
      window.confirm(
        `Reject ${this.state.recruits[this.state.activeRecruit].name} ?`
      )
    ) {
      new FetchData({ id, scope: 'recruits/reject' }).get().then(res => {
        if (res.status === 'ok') {
          this.setRecruitStatus(id, Recruiter.statuses.rejected);
        } else {
          alert('Rejection failed');
        }
      });
    }
  };

  handleClick(id) {
    console.log(`activate recruit ${id}`);
    if (this.state.recruits[id].status !== Recruiter.statuses.unclaimed)
      this.setState({ activeRecruit: id });
  }

  recruitLine(id, recruit, isEnabled) {
    const avatarImg = `https://image.eveonline.com/Character/${id}_64.jpg`;
    return (
      <div key={id} style={localStyles.recruit}>
        {recruit.status === Recruiter.statuses.claimed && (
          <ClaimedIcon style={localStyles.icon} fontSize="24px" />
        )}
        {recruit.status === Recruiter.statuses.approved && (
          <ApproveIcon style={localStyles.icon} fontSize="24px" />
        )}
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
        />
      </div>
    );
  }

  sectionList(label, list, isEnabled) {
    return (
      <div style={localStyles.section}>
        <div style={localStyles.h2}>{label}</div>
        {Misc.dictLen(list) > 0 ? (
          Object.keys(list).map(key => this.recruitLine(key, list[key], isEnabled))
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
    this.setState({ activeRecruit: null });
  };

  render() {
    if (this.state.loading) {
      console.log('loading');
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    if (!(
      this.state.loading ||
      this.state.roles.is_admin ||
        this.state.roles.is_recruiter ||
        this.state.roles.is_senior_recruiter)
      ) {
      // no roles? wrong place
      window.location = '/';
    }
    console.log('loaded');

    // 3 sections in order: claimed, approved, unclaimed.
    const claimed = this.applyFilter(Recruiter.statuses.claimed);
    const unclaimed = this.applyFilter(Recruiter.statuses.unclaimed);
    const approved = this.applyFilter(Recruiter.statuses.approved);

    return [
      this.state.roles.is_admin &&
      <a href="/app/admin">
        <button style={{...localStyles.primaryButton, float: 'right'}}>Admin</button>,
      </a>,
      !this.state.activeRecruit && (
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
          <div style={localStyles.approved}>
            {this.sectionList('Accepted', approved, this.state.roles.is_senior_recruiter)}
          </div>
          <div style={localStyles.unclaimed}>
            {this.sectionList('Unclaimed', unclaimed, this.state.roles.is_recruiter)}
          </div>
        </div>
      ),
      this.state.activeRecruit &&
        this.state.recruits[this.state.activeRecruit].status !==
          Recruiter.statuses.unclaimed && [
          <IconBtn
            src={BackImg}
            alt="back"
            label="Back"
            onClick={this.handleBack}
            style={{ border: 'none' }}
          />,
          <Evidence style={localStyles.evidence} main={this.state.activeRecruit} />,
        ],
    ];
  }
}
