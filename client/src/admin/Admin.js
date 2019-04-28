import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TableStyles from '../evidence/TableStyles';
import AdminRoles from './AdminRoles';
import AdminLists from './AdminLists';
import AdminQuestions from './AdminQuestions';
import styles from '../Applicant/ApplicantStyles';
import FetchData from '../common/FetchData';
import AdminConfig from './AdminConfig';


const primary = TableStyles.styles.themeColor.color;

const localStyles = {
  ...styles,
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
    textAlign: 'center',
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
    left: '12px',
    top: '12px',
  },
};

class Admin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      roles: {
        is_recruiter: false,
        is_senior_recruiter: false,
        is_admin: false,
      },
    };
  }

  componentDidMount() {
    new FetchData({ scope: 'user/roles' })
      .get()
      .then(roles => {
        this.setState({ roles: roles.info });
      })
  }


  render() {
    return (
      < >
        {this.state.roles.is_recruiter &&
        <a href="/app/recruiter">
          <button style={{...localStyles.primaryButton, float: 'right'}}>Recruiter</button>,
        </a>}
        <h1 style={localStyles.h1}>Admin</h1>
        <div style={localStyles.logout}>
          <a href="/auth/logout">
            <button style={localStyles.secondaryButton}>
              Sign out
            </button>
          </a>
        </div>
        <Tabs>
          <TabList>
            <Tab style={localStyles.tab}>     Questions     </Tab>
            <Tab style={localStyles.tab}>       Roles       </Tab>
            <Tab style={localStyles.tab}>       Lists       </Tab>
            <Tab style={localStyles.tab}>      Config       </Tab>
          </TabList>
          <TabPanel><AdminQuestions/></TabPanel>
          <TabPanel><AdminRoles/></TabPanel>
          <TabPanel><AdminLists/></TabPanel>
          <TabPanel><AdminConfig /></TabPanel>
        </Tabs>
      </>
    );
  }
}

Admin.propTypes = {};

export default Admin;
