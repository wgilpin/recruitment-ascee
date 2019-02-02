import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import FetchData from '../common/FetchData';
import TableStyles from '../TableStyles';
import AdminRoles from './AdminRoles';

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
  }
};

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],

    };
  }

  componentWillMount() {
    let fetchQs = new FetchData({ scope: 'questions' });
    fetchQs.get().then(data => this.setState({ questions: data }));
  }

  buildQuestionsPanel = () => {
    return (
      <TabPanel>
        <h2 style={styles.heading}>Applicant Questions</h2>
        {Object.keys(this.state.questions).map(id => {
          return (
            < >
              <textarea
                style={styles.answer}
                id={id}
                onChange={this.handleAnswerChanged}
              >
                {this.state.questions[id]}
              </textarea>
              <hr style={styles.hr} />
            </>
          );
        })}
      </TabPanel>
    );
  };

  buildConfigPanel() {
    return < >
    </>
  }

  render() {
    return (
      < >
        <h1 style={styles.h1}>Admin</h1>
        <Tabs>
          <TabList>
            <Tab style={styles.tab}>     Questions     </Tab>
            <Tab style={styles.tab}>       Roles       </Tab>
            <Tab style={styles.tab}>      Config       </Tab>
          </TabList>
          {this.buildQuestionsPanel()}
          <AdminRoles />
          {this.buildConfigPanel()}
        </Tabs>
      </>
    );
  }
}

Admin.propTypes = {};

export default Admin;
