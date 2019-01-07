import React, { Component } from 'reactn';
import queryString from 'query-string';
import RecruiterImg from './images/titansRec.png';
import ApplicantImg from './images/Rifter.png';
import Recruiter from './recruiter/Recruiter';
import Applicant from './Applicant';

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

  render() {
    const params = queryString.parse(this.props.location.search);
    return (
      <React.Fragment>
        {this.props.location.search === '' && (
          <div style={this.styles.outer}>
            <a href="/login">
              <img
                src={RecruiterImg}
                style={this.styles.image}
                alt="Recruiters"
              />
            </a>
            <a href="/login">
              <img
                src={ApplicantImg}
                style={this.styles.image}
                alt="Applicant"
              />
            </a>
          </div>
        )}
        {params.showing === 'recruiter' && <Recruiter />}
        {params.showing === 'applicant' && <Applicant />}
      </React.Fragment>
    );
  }
}

export default MainMenu;
