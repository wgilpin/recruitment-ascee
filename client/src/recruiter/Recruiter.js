import React from 'reactn';
import FetchData from '../FetchData';
import ClaimedIcon from './images/claimed.png';
import EscalatedIcon from './images/escalated.png';
import Evidence from '../Evidence';


const styles = {
  grid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: '1fr 1fr 1fr',
    gridColumnGap: '20px',
    gridRowGap: '10px',
    margin: 'auto',
    justifyItems: 'left',
  },
  name: {
    fontWeight: 500
  },
  claimed: {
    gridColumn: 1,
    gridRow: 1
  },
  escalated: {
    gridColumn: 1,
    gridRow: 2
  },
  unclaimed: {
    gridColumn: 1,
    gridRow: 3},
  evidence: {
    gridColumn: 2,
    gridRow: '1/3'
  },
}


export default class Recruiter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // Hydrate the global state with the response from /api/recruits
    // api recruits returns 3 lists:
    //   claimed: my recruits to process
    //   escalated: recruits I claimed then escalated
    //   unclaimed: all unclaimed
    this.setGlobal(
      new FetchData({ id: this.global.id, scope: 'recruits' })
        .get()
        // Set the global `recruits` list, and set no recruit selected
        .then(recruits => ({ recruits, activeRecruit: null }))
        // Fail gracefully, set the global `error`
        //   property to the caught error.
        .catch(err => ({ error: err }))
    );
  }

  handleClaim({currentTarget: {id}}) {
    // e.currentTarget.id is recruit id
    new FetchData(id, 'recruits/claim')
      .then(recruit => {
        // need to move from either claimed or escalated to claimed
        // TODO: does delete work if not there?
        const unclaimed = this.global.recruits.unclaimed;
        delete unclaimed[id];
        const escalated = this.global.recruits.escalated;
        delete escalated[id];
        this.setGlobal({
          recruits: {
            unclaimed,
            escalated,
            claimed: {
              ...this.global.recruits.claimed,
              [id]: recruit,
            }
          }
        })
      })
      .catch(err => ({ error: err }))
  }

  handleEscalate(e) {
    // e.currentTarget.id is recruit id
    new FetchData(e.currentTarget.id, 'recruits/escalate')
      .then(recruit => {
        // TODO: need to move from claimed to escalated
        const claimed = this.global.recruits.claimed;
        delete claimed[e.currentTarget.id];
        const escalated = {
          ...this.global.recruits.claimed,
          [e.currentTarget.id]: recruit,
        };
        this.setGlobal({
          recruits: {
            ...this.global.recruits,
            claimed,
            escalated,
          }
        })
      })
      .catch(err => ({ error: err }))
  }

  handleClick(e) {
    this.setGlobal({ activeRecruit: e.currentTarget.id })
  }

  recruitLine(recruit) {
    return (
      <div key={recruit.id}>
        {recruit.status === 'claimed' && <img alt="Claimed" size={32} src={ClaimedIcon} />}
        {recruit.status === 'escalated' && <img alt="Escalated" size={32} src={EscalatedIcon} />}
        <span style={styles.name}>{recruit.name}</span>
        {!recruit.status !== 'claimed' &&
          <button id={recruit.id} onclick={this.handleClaim}>
            Claim
          </button>}
        {!recruit.status === 'claimed' &&
          <button id={recruit.id} onclick={this.handleEscalate}>
            Escalate
          </button>}
      </div>
    );
  }

  render() {
    // 3 sections in order: claimed, escalated, unclaimed.
    return <React.Fragment>
      <div style={styles.claimed}>
        {Object.keys(this.global.recruits.claimed).map(key => this.recruitLine(key))}
      </div>
      <div style={styles.escalated}>
        {Object.keys(this.global.recruits.claimed).map(key => this.recruitLine(key))}
      </div>
      <div style={styles.unclaimed}>
        {Object.keys(this.global.recruits.claimed).map(key => this.recruitLine(key))}
      </div>
      {this.global.activeRecruit && <Evidence style={styles.evidence}/>}
    </React.Fragment>
  }
}
