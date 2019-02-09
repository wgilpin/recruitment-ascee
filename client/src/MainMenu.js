import React, { Component } from 'reactn';
import queryString from 'query-string';
import RecruiterImg from './images/titansRec.png';
import ApplicantImg from './images/Rifter.png';
import Recruiter from './recruiter/Recruiter';
import Applicant from './Applicant/Applicant';
import Admin from './admin/Admin';
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
        // marginLeft: 12,
        // marginRight: 12,
        width: '500px',
        height: '500px',
        margins: 'auto',
      },
    };
  }

  validParams = {
    recruiter: 'recruiter',
    applicant: 'applicant',
    admin: 'admin',
  }

  render() {
    const params = queryString.parse(this.props.location.search);
    if (!(params.showing in this.validParams)) {
      params.showing = 'error';
      console.error(`invalid route showing=${params.showing}`)
    }
    return (
      <div style={this.styles.outer}>
        <a href="/auth/login">
          <img
            src={ApplicantImg}
            style={this.styles.image}
            alt="log in"
          />
        </a>
      </div>
    );
  }
}

export default MainMenu;
