import React, { Component } from 'reactn';
import queryString from 'query-string';
import RecruiterImg from './images/titansRec.png';
import ApplicantImg from './images/Rifter.png';
import Recruiter from './recruiter/Recruiter';

class MainMenu extends Component {
  constructor(props) {
    super(props);
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

  handleRecruiter = id => {
    console.log('handleRecruiter');
    this.setState({ showing: 'recruiter' });
  };

  handleApplicant = id => {
    console.log('handleApplicant');
    this.setState({ showing: 'applicant' });
  };

  render() {
    const params = queryString.parse(this.props.location.search);
    return (
      <React.Fragment>
        {params.showing === '' && (
          <div style={this.styles.outer}>
            <a href="/login">
              <img
                src={RecruiterImg}
                style={this.styles.image}
                alt="Recruiters"
                onClick={this.handleRecruiter}
              />
            </a>
            <a href="/login">
              <img
                src={ApplicantImg}
                style={this.styles.image}
                alt="Applicant"
                onClick={this.handleApplicant}
              />
            </a>
          </div>
        )}
        {params.showing === 'recruiter' && <Recruiter />}
      </React.Fragment>
    );
  }
}

export default MainMenu;
