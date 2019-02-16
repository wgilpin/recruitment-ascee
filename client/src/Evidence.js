import React from 'react';
import TabsHeader from './TabsHeader';
import Alts from './Alts';
import Mail from './Mail';
import Assets from './Assets';
import Skills from './Skills';
import TableBookmarks from './TableBookmarks';
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

const styles = {
  outer: {
    display: 'flex',
  },
  alts: {
    display: 'flex flex-column',
    width: '300px',
    backgroundColor: '#333',
    height: '100%',
    paddingTop: 100,
  },
  right: {
    padding: '16px',
    display: 'flex-column',
    width: '100%',
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
  }
};

export default class Evidence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: null,
      currentAlt: null,
    };
  }

  changeTab = (tabId) => {
    console.log('evidence click ', tabId);
    this.setState({ activeTab: tabId });
    this.forceUpdate();
  }

  changeAlt = (altId) => {
    console.log('change alt', altId);
    this.setState({ currentAlt: altId, activeTab: null });
  }

  doLogout() {
    window.location = '/app/';
  }

  render() {
    let active = (this.state || {}).activeTab;
    return (
      <div style={styles.outer}>
        <div style={styles.alts}>
          <Alts main={this.props.main}
            onAltSelect={this.changeAlt}
          />
          <button style={styles.button} onClick={this.doLogout}>Sign out</button>
        </div>
        <div style={styles.right} >
          <div style={styles.tabHeader}>
            {this.state.currentAlt && <TabsHeader onTabChange={this.changeTab} />}
          </div>
          <div style={styles.tabBody}>
            {(active === 'Wallet') &&
              <TableWallet style={styles.tabBody} alt={this.state.currentAlt}></TableWallet>}
            {(active === 'Assets') &&
              <Assets style={styles.tabBody} alt={this.state.currentAlt}></Assets>}
            {(active === 'Mail') &&
              <Mail style={styles.tabBody} alt={this.state.currentAlt}></Mail>}
            {(active === 'Skills') &&
              <Skills style={styles.tabBody} alt={this.state.currentAlt}></Skills>}
            {(active === 'Bookmarks') &&
              <TableBookmarks style={styles.tabBody} alt={this.state.currentAlt}></TableBookmarks>}
            {(active === 'Contacts') &&
              <TableContacts style={styles.tabBody} alt={this.state.currentAlt}></TableContacts>}
            {(active === 'Contracts') &&
              <TableContracts style={styles.tabBody} alt={this.state.currentAlt}></TableContracts>}
            {(active === 'Calendar') &&
              <TableCalendar style={styles.tabBody} alt={this.state.currentAlt}></TableCalendar>}
            {(active === 'Blueprints') &&
              <TableBlueprints style={styles.tabBody} alt={this.state.currentAlt}></TableBlueprints>}
            {(active === 'Market') &&
              <TableMarket style={styles.tabBody} alt={this.state.currentAlt}></TableMarket>}
            {(active === 'Fittings') &&
              <TableFittings style={styles.tabBody} alt={this.state.currentAlt}></TableFittings>}
            {(active === 'Industry') &&
              <TableIndustry style={styles.tabBody} alt={this.state.currentAlt}></TableIndustry>}
            {(active === 'PI') &&
              <TablePI style={styles.tabBody} alt={this.state.currentAlt}></TablePI>}
            {(active === 'Standings') &&
              <TableStandings style={styles.tabBody} alt={this.state.currentAlt}></TableStandings>}
          </div>
        </div>
      </div>
    );
  }
}
