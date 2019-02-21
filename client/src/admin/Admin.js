import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TableStyles from '../TableStyles';
import AdminRoles from './AdminRoles';
import AdminLists from './AdminLists';
import AdminQuestions from './AdminQuestions';

const primary = TableStyles.styles.themeColor.color;

const styles = {
  searchButton: {
    borderRadius: '3px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'darkgray',
    backgroundColor: '#0000',
    padding: '6px',
  },
  smallButtonImg: {
    width: '20px',
    height: '20px',
  },
  h1: {
    color: primary,
  },
  h2: {
    color: primary,
  },
  userLine: {
    justifyItems: 'left',
    textAlign: 'left',
    padding: '12px',
  },
  moveButtons: {
    paddingLeft: '24px',
    position: 'relative',
    top: '11px',
  },
  searchInput: {
    backgroundColor: `#000`,
    borderStyle: `solid`,
    borderWidth: `1px`,
    borderColor: `darkgray`,
    height: `23px`,
    padding: `6px`,
    float: 'right',
  },
  searchBtnOuter: {
    float: 'right',
    cursor: 'pointer',
    marginRight: '12px',
  },
  tab: {
    width: '20%',
  },
  logout: {
    position: 'absolute',
    right: '16px',
    top: '8px',
  },
};

class Admin extends Component {


  buildConfigPanel() {
    return < >
    <h2>Config</h2>
    </>
  }

  render() {
    return (
      < >
        <h1 style={styles.h1}>Admin</h1>
        <div style={styles.logout}><a href="/auth/logout">Sign out</a></div>
        <Tabs>
          <TabList>
            <Tab style={styles.tab}>     Questions     </Tab>
            <Tab style={styles.tab}>       Roles       </Tab>
            <Tab style={styles.tab}>       Lists       </Tab>
            <Tab style={styles.tab}>      Config       </Tab>
          </TabList>
          <TabPanel><AdminQuestions/></TabPanel>
          <TabPanel><AdminRoles/></TabPanel>
          <TabPanel><AdminLists/></TabPanel>
          <TabPanel>{this.buildConfigPanel()}</TabPanel>
        </Tabs>
      </>
    );
  }
}

Admin.propTypes = {};

export default Admin;
