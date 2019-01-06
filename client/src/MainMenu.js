import React, { Component } from 'reactn';
import RecruiterImg from './images/recruiter.png';
import ApplicantImg from './images/applicant.png';
import Recruiter from './recruiter/Recruiter';

class MainMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: '',
    };
    this.styles = {
      outer: {
        marginTop: 40,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      },
      image: {
        marginLeft: 12,
        marginRight: 12,
        width: '500px',
        height: '500px',
        margins: 'auto',
      },
    };
  }

  handleRecruiter = (id) => {
    console.log('handleRecruiter');
    this.setState({ showing: 'recruiter' });
  }

  handleApplicant = (id) => {
    console.log('handleApplicant');
    this.setState({ showing: 'applicant' });
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.showing === '') &&
        <div style={this.styles.outer}>
          <img
            src={RecruiterImg}
            style={this.styles.image}
            alt="Recruiters"
            onClick={this.handleRecruiter}
          />
          <img
            src={ApplicantImg}
            style={this.styles.image}
            alt="Applicant"
            onClick={this.handleApplicant}
          />
        </div>}
        {(this.state.showing === 'recruiter') && <Recruiter />}
      </React.Fragment>
    );
  }
}

export default MainMenu;
