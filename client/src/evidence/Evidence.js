import React from 'react';
import ReactTooltip from 'react-tooltip';
import TabsHeader from './TabsHeader';
import Alts from './Alts';
import Alt from '../common/Alt';
import Mail from './Mail';
import Assets from './Assets';
import Skills from './Skills';
import TableBookmarks from './TableBookmarks';
import TableClones from './TableClones';
import TableContacts from './TableContacts';
import TableCalendar from './TableCalendar';
import TableContracts from './TableContracts';
import TableBlueprints from './TableBlueprints';
import TableMarket from './TableMarket';
import TableWallet from './TableWallet';
import TablePI from './TablePI';
import TableStandings from './TableStandings';
import TableFittings from './TableFittings';
import TableIndustry from './TableIndustry';
import NotesPage from '../notes/NotesPage';
import closeImg from '../images/close.png';
import checkImg from '../images/check.png';
import RoundImage from '../common/RoundImage';
import FetchData from '../common/FetchData';

const styles = {
  outer: {
    display: 'flex',
    maxWidth: '800px',
  },
  alts: {
    display: 'flex flex-column',
    width: '300px',
    minWidth: '240px',
    backgroundColor: '#333',
    height: '100%',
    paddingTop: 100,
  },
  right: {
    padding: '16px',
    display: 'flex-column',
    width: '100%',
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#01799A',
    marginBottom: '6px',
  },
  recruiter: {
    backgroundColor: '#111',
    paddingTop: '8px',
    paddingLeft: '8px',
    marginBottom: '12px',
  },
  tabHeader: {
    left: '50px',
  },
  tabBody: {
    paddingTop: '50px',
  },
  button: {
    marginBottom: '6px',
    height: '32px',
    width: '90%',
    backgroundColor: '#111',
    color: 'lightgray',
    borderWidth: 0,
  },
  label: {
    color: '#01799A',
    fontWeight: 600,
    position: 'relative',
    top: '-12px',
  },
  RoundImage: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '8px',
    paddingBottom: '16px',
  },
  acceptReject: {
    paddingBottom: '12px',
  },
};

export default class Evidence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: null,
      currentAlt: null,
      currentCorp: null,
    };
  }

  async componentDidMount() {
    const roles = await new FetchData({ scope: 'user/roles' }).get();
    this.setState({ roles: roles.info, loading: false, activeTab: 'Notes' });
  }

  changeTab = tabId => {
    console.log('evidence click ', tabId);
    this.setState({ activeTab: tabId });
    this.forceUpdate();
  };

  changeAlt = altId => {
    console.log('change alt', altId);
    this.setState(
      {
        currentAlt: altId,
        currentCorp: null,
        activeTab: null,
        currentTargetId: altId,
      },
      () => this.setState({ activeTab: 'Notes' })
    );
  };

  changeCorp = corpId => {
    console.log('change corp', corpId);
    this.setState(
      {
        currentAlt: null,
        currentCorp: corpId,
        activeTab: null,
        currentTargetId: corpId,
      },
      () => this.setState({ activeTab: 'Notes' })
    );
  };

  doLogout() {
    new FetchData({ scope: 'logout' })
      .get()
      .then(() => (window.location = '/app/'));
  }

  doReject = () => {
    if (window.confirm('Reject this applicant?')) {
      new FetchData({ id: this.props.main, scope: 'recruits/reject' })
        .get()
        .then(() => {
          window.location = '/app/recruiter';
        });
    }
  };

  doApprove = () => {
    if (window.confirm('Approve this applicant?')) {
      new FetchData({ id: this.props.main, scope: 'recruits/approve' })
        .get()
        .then(() => {
          window.location = '/app/recruiter';
        });
    }
  };

  render() {
    let active = (this.state || {}).activeTab;
    const { currentAlt, currentCorp, currentTargetId } = this.state;
    return (
      <div style={styles.outer}>
        <div style={styles.alts}>
          <Alts
            main={this.props.main}
            onAltSelect={this.changeAlt}
            onCorpSelect={this.changeCorp}
            childrenTop={true}
            highlightMain={true}
            showPointer={true}
          >
            {this.props.showRecruiter && (
              <div style={styles.recruiter}>
                <div style={styles.sectionTitle}>Recruiter</div>
                <Alt
                  style={styles.div}
                  name={this.props.recruiterName}
                  id={this.props.showRecruiter}
                />
              </div>
            )}
          </Alts>
          <div style={styles.acceptReject}>
            <span data-tip="Approve" style={styles.RoundImage}>
              <RoundImage
                src={checkImg}
                color="green"
                onClick={this.doApprove}
              />
            </span>
            <span data-tip="Reject" style={styles.RoundImage}>
              <RoundImage src={closeImg} color="red" onClick={this.doReject} />
            </span>
            <ReactTooltip />
          </div>
        </div>
        <div style={styles.right}>
          <div style={styles.tabHeader}>
            <TabsHeader
              onTabChange={this.changeTab}
              onlyFirst={currentAlt || currentCorp ? false : true}
              corporation={currentCorp}
            />
          </div>
          <div style={styles.tabBody}>
            {active === 'Notes' && (
              <NotesPage
                style={styles.tabBody}
                targetId={this.props.main}
              />
            )}
            {active === 'Wallet' && (
              <TableWallet
                style={styles.tabBody}
                corporation={currentCorp}
                targetId={currentTargetId}
              />
            )}
            {active === 'Assets' && (
              <Assets
                style={styles.tabBody}
                corporation={currentCorp}
                targetId={currentTargetId}
              />
            )}
            {active === 'Mail' && (
              <Mail style={styles.tabBody} targetId={currentTargetId} />
            )}
            {active === 'Skills' && (
              <Skills style={styles.tabBody} targetId={currentTargetId} />
            )}
            {active === 'Bookmarks' && (
              <TableBookmarks
                style={styles.tabBody}
                corporation={currentCorp}
                targetId={currentTargetId}
              />
            )}
            {active === 'Contacts' && (
              <TableContacts
                style={styles.tabBody}
                corporation={currentCorp}
                targetId={currentTargetId}
              />
            )}
            {active === 'Contracts' && (
              <TableContracts
                style={styles.tabBody}
                targetId={currentTargetId}
              />
            )}
            {active === 'Calendar' && (
              <TableCalendar
                style={styles.tabBody}
                targetId={currentTargetId}
              />
            )}
            {active === 'Blueprints' && (
              <TableBlueprints
                style={styles.tabBody}
                targetId={currentTargetId}
              />
            )}
            {active === 'Market' && (
              <TableMarket style={styles.tabBody} targetId={currentTargetId} />
            )}
            {active === 'Fittings' && (
              <TableFittings
                style={styles.tabBody}
                targetId={currentTargetId}
              />
            )}
            {active === 'Industry' && (
              <TableIndustry
                style={styles.tabBody}
                corporation={currentCorp}
                targetId={currentTargetId}
              />
            )}
            {active === 'PI' && (
              <TablePI style={styles.tabBody} targetId={currentTargetId} />
            )}
            {active === 'Standings' && (
              <TableStandings
                style={styles.tabBody}
                targetId={currentTargetId}
              />
            )}
            {active === 'Clones' && (
              <TableClones
                style={styles.tabBody}
                targetId={this.state.currentAlt}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
