import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import FetchData from '../common/FetchData';
import Alt from '../Alt';
import UpImg from '../images/arrow_up_24x24.png';
import DownImg from '../images/arrow_down_24x24.png';
import SearchImg from '../images/magnifying_glass_24x24.png';
import TableStyles from '../TableStyles';

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
      searchText: '',
      searchResults: [],
      staff: {},
    };
  }

  componentWillMount() {
    let fetchQs = new FetchData({ scope: 'questions' });
    fetchQs.get().then(data => this.setState({ questions: data }));
    let fetchStaff = new FetchData({ scope: 'character/all' });
    fetchStaff.get().then(data => this.setState({ staff: data }));
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

  handleMove(id, direction) {
    // TODO: + confirm dixt in API
    const user = this.state.staff[id];
    let oldState = 0;
    if (user.isRecruiter) {
      oldState = 1;
    }
    if (user.isSnrRecruiter) {
      oldState = 2;
    }
    if (user.isAdmin) {
      oldState = 3;
    }
    let newState = oldState + (direction === 'up' ? 1 : -1);
    newState = Math.min(newState, 3);
    newState = Math.max(newState, 0);
    this.setState({
      staff: {
        ...this.state.staff,
        [id]: {
          ...this.state.staff[id],
          isAdmin: newState === 3,
          isSnrRecruiter: newState === 2,
          isRecruiter: newState === 1,
        },
      },
    });
  }

  recruitLine(id, recruiter) {
    return (
      <div key={id} style={styles.userLine}>
        <Alt
          onClick={() => this.handleClick(id)}
          name={recruiter.name}
          id={recruiter.id}
          style={{float: 'left', width: '250px'}}/>
        <img
          style={styles.moveButtons}
          src={UpImg}
          alt="up"
          onClick={() => this.handleMove(id, 'up')}
        />
        <img
          style={styles.moveButtons}
          src={DownImg}
          alt="up"
          onClick={() => this.handleMove(id, 'down')}
        />
      </div>
    );
  }

  sortByNameFn(a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  }

  sectionList(label, list) {
    /*
     * create a list of users for display
     *
     * @param {label} string - text lable for the section
     * @param {list} [object] - list of users
     * @returns jsx
     */
    return [
      <div style={styles.h2}>{label}</div>,
      list.length > 0 ? (
        list
          .sort(this.sortByNameFn)
          .map(user => this.recruitLine(user.id, user))
      ) : (
        <div style={styles.noneText}>None</div>
      ),
    ];
  }

  makeSearchResultLine(char) {
    // TODO:
    return (
      <div>
        {char.name}
        <img
          style={styles.moveButtons}
          src={UpImg}
          alt="up"
          onClick={() => this.handleMove(char.id, 'up')}
        />
        <img
          style={styles.moveButtons}
          src={DownImg}
          alt="up"
          onClick={() => this.handleMove(char.id, 'down')}
        />
      </div>
    );
  }

  handleSearch() {
    // TODO:
    new FetchData({ scope: 'character/find', param1: this.state.searchText })
      .get()
      .then(res => {
        this.setState({ searchResults: res });
      });
  }

  updateSearchText(evt) {
    this.setState({
      searchText: evt.target.value,
    });
  }

  filterStaff(role){
    return Object
      .keys(this.state.staff || {})
      .filter(c => !!(this.state.staff[c][`is${role}`]))
      .map(id => this.state.staff[id]);
  }

  buildRolesPanel = () => {
    const admins = this.filterStaff('Admin');
    const recruiters = this.filterStaff('Recruiter');
    const snrRecruiters = this.filterStaff('SnrRecruiter');
    return [
      <TabPanel>
        <h2 style={styles.h2}>Recruiters</h2>
        {this.sectionList('Admins', admins)}
        <hr />
        {this.sectionList('Senior Recruiters', snrRecruiters)}
        <hr />
        {this.sectionList('Recruiters', recruiters)}
        <hr />
        <div style={styles.h2}>Others</div>
        <div>
          <div>
            {this.state.searchResults.forEach(char =>
              this.makeSearchResultLine(char),
            )}
          </div>
          <div style={styles.searchBtnOuter}>
            <button onClick={this.handleSearch} style={styles.searchButton}>
              <img style={styles.smallButtonImg} src={SearchImg} alt="Search" />
            </button>
          </div>
          <div>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="search..."
              onChange={this.updateSearchText}
              value={this.state.searchText}
            />
          </div>
        </div>
      </TabPanel>
    ];
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
          {this.buildRolesPanel()}
          {this.buildConfigPanel()}
        </Tabs>
      </>
    );
  }
}

Admin.propTypes = {};

export default Admin;
