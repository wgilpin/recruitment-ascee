import React from 'react';
import TabsHeader from './TabsHeader';
import Alts from './Alts';
import Wallet from './Wallet';
import Mail from './Mail';
import Assets from './Assets';
import Skills from './Skills';
import Bookmarks from './Bookmarks';
import Contacts from './Contacts';
import Contracts from './Contracts';

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
    console.log('evidence click ');
    this.setState({ activeTab: tabId });
    this.forceUpdate();
  }

  changeAlt = (altId) => {
    console.log('change alt', altId);
    this.setState({ currentAlt: altId });
  }

  render() {
    let active = (this.state || {}).activeTab;
    return (
      <div style={styles.outer}>
        <div style={styles.alts}>
          <Alts main={this.props.main}
            onAltSelect={this.changeAlt}
          />
        </div>
        <div style={styles.right} >
          <div style={styles.tabHeader}>
            <TabsHeader onTabChange={this.changeTab} />
          </div>
          <div style={styles.tabBody}>
            {(active === 'wallet') &&
              <Wallet style={styles.tabBody} alt={this.state.currentAlt}></Wallet>}
            {(active === 'assets') &&
              <Assets style={styles.tabBody} alt={this.state.currentAlt}></Assets>}
            {(active === 'mail') &&
              <Mail style={styles.tabBody} alt={this.state.currentAlt}></Mail>}
            {(active === 'skills') &&
              <Skills style={styles.tabBody} alt={this.state.currentAlt}></Skills>}
            {(active === 'bookmarks') &&
              <Bookmarks style={styles.tabBody} alt={this.state.currentAlt}></Bookmarks>}
            {(active === 'contacts') &&
              <Contacts style={styles.tabBody} alt={this.state.currentAlt}></Contacts>}
            {(active === 'contracts') &&
              <Contracts style={styles.tabBody} alt={this.state.currentAlt}></Contracts>}
          </div>
        </div>
      </div>
    );
  }
}
