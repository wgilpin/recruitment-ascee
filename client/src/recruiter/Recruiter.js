import React from 'reactn';
import FetchData from '../common/FetchData';
import ClaimedIcon from 'react-ionicons/lib/MdStar';
import EscalatedIcon from 'react-ionicons/lib/IosAlert';
import Evidence from '../Evidence';
import Misc from '../common/Misc';
import RoundImage from '../common/RoundImage';
import RecruitButtonBar from './RecruitButtonBar';

import TableStyles from '../TableStyles';

const styles = {
  ...TableStyles.styles,
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
    marginBotom: '16px',
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
  escalated: {
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
  buttons: {
    position: 'absolute',
    left: '350px',
  },
  icon: {
    marginRight: '32px',
    height: '32px',
    width: '32px',
    fill: TableStyles.styles.themeColor.color,
  },
};

export default class Recruiter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static statuses = {
    unclaimed: 'new',
    escalated: 'escalated',
    claimed: 'claimed',
    accepted: 'accepted',
    rejected: 'rejected',
  };

  componentDidMount() {
    // Hydrate the global state with the response from /api/recruits
    // api recruits returns 3 lists:
    //   claimed: my recruits to process
    //   escalated: recruits I claimed then escalated
    //   unclaimed: all unclaimed
    this.setGlobal(
      new FetchData({ id: this.global.id, scope: 'applicant_list' })
        .get()
        // Set the global `recruits` list, and set no recruit selected
        .then(recruits => {
          console.log(`fetched ${recruits}`);
          // array -> object
          const recruitDict = {};
          recruits.info.forEach(rec => {
            recruitDict[rec.user_id] = rec;
          });
          return { recruits: recruitDict, activeRecruit: null };
        })
        // Fail gracefully, set the global `error`
        //   property to the caught error.
        .catch(err => {
          console.log('mounting error');
          return { error: err };
        }),
    );
  }

  setRecruitStatus(id, status) {
    this.setGlobal({
      recruits: {
        ...this.global.recruits,
        [id]: {
          ...this.global.recruits[id],
          status: status,
        },
      },
    });
  }

  handleDrop = id => {
    console.log(`handleDrop ${id}`);
    const plan =
      this.global.recruits[id].status === Recruiter.statuses.escalated
        ? { scope: 'recruits/deescalate', status: Recruiter.statuses.claimed }
        : { scope: 'recruits/abandon', status: Recruiter.statuses.unclaimed };
    new FetchData({ id, scope: plan.scope })
      .post()
      .then(() => this.setRecruitStatus(id, plan.status))
      .catch(err => ({ error: err }));
  };

  handleClaim = id => {
    console.log(`handleClaim ${id}`);
    new FetchData({ id, scope: 'recruits/claim' })
      .post()
      .then(() => this.setRecruitStatus(id, Recruiter.statuses.claimed))
      .catch(err => ({ error: err }));
  };

  handleEscalate = id => {
    console.log(`handleEscalate ${id}`);
    new FetchData({ id, scope: 'recruits/escalate' })
      .post()
      .then(() => this.setRecruitStatus(id, Recruiter.statuses.escalated))
      .catch(err => ({ error: err }));
  };

  handleClick(id) {
    console.log(`activate recruit ${id}`);
    this.setGlobal({ activeRecruit: id });
  }

  recruitLine(id, recruit) {
    const avatarImg = `https://image.eveonline.com/Character/${id}_64.jpg`;
    return (
      <div key={id} style={styles.recruit}>
        {recruit.status === Recruiter.statuses.claimed && (
          <ClaimedIcon style={styles.icon} fontSize="24px" />
        )}
        {recruit.status === Recruiter.statuses.escalated && (
          <EscalatedIcon style={styles.icon} fontSize="24px" />
        )}
        <span onClick={() => this.handleClick(id)}>
          <RoundImage src={avatarImg} />
          <span style={styles.name}>{recruit.name}</span>
        </span>
        <RecruitButtonBar
          status={recruit.status}
          style={styles.buttons}
          id={recruit.mainId}
          onClaim={this.handleClaim}
          onDrop={this.handleDrop}
          onEscalate={this.handleEscalate}
        />
      </div>
    );
  }

  sectionList(label, list) {
    return [
      <div style={styles.h2}>{label}</div>,
      Misc.dictLen(list) > 0 ? (
        Object.keys(list).map(key => this.recruitLine(key, list[key]))
      ) : (
        <div style={styles.noneText}>None</div>
      ),
    ];
  }

  applyFilter(status) {
    const res = {};
    Object.keys(this.global.recruits || {})
      .filter(key => this.global.recruits[key].status === status)
      .forEach(key => {
        res[key] = this.global.recruits[key];
      });
    return res;
  }

  render() {
    // 3 sections in order: claimed, escalated, unclaimed.
    const claimed = this.applyFilter(Recruiter.statuses.claimed);
    const unclaimed = this.applyFilter(Recruiter.statuses.unclaimed);
    const escalated = this.applyFilter(Recruiter.statuses.escalated);

    return [
      !this.global.activeRecruit && (
        < >
          <h1 style={styles.headerText}>Applications Pending</h1>
          <div style={styles.claimed}>
            {this.sectionList('Claimed', claimed)}
          </div>
          <hr />
          <div style={styles.escalated}>
            {this.sectionList('Escalated', escalated)}
          </div>
          <hr />
          <div style={styles.unclaimed}>
            {this.sectionList('Unclaimed', unclaimed)}
          </div>
        </>
      ),
      this.global.activeRecruit && <Evidence style={styles.evidence} main={this.global.activeRecruit} />,
    ];
  }
}
