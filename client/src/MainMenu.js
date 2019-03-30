import React, { Component } from 'reactn';
import ApplicantImg from './images/Rifter.png';
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
        width: '100%',
        height: '100%',
        margins: 'auto',
      },
    };
  }

  validParams = {
    recruiter: 'recruiter',
    applicant: 'applicant',
    admin: 'admin',
  };

  render() {
    return (
      <div style={this.styles.outer}>
        <a href="/auth/login">
          <img src={ApplicantImg} style={this.styles.image} alt="log in" />
        </a>
      </div>
    );
  }
}

export default MainMenu;
