import React from 'react';
import exampleImg from '../images/auth.png';
import Styles from '../Applicant/ApplicantStyles';
import styles from './../Applicant/ApplicantStyles';

function WrongCharacter() {
  return (
    <div>
      <h1
        style={{
          ...Styles.heading,
          ...Styles.h1,
          width: 'fit-content',
          margin: '0px auto',
        }}
      >
        Wrong Character
      </h1>
      <p>
        When logging in and then addding scopes to a character, be careful that the same character
        name is selected in the drop down list on both pages.
      </p>
      <p>PLEASE SELECT YOUR CHARACTER WHEN YOU SEE THIS SCREEN</p>
      <img style={{ width: '400px' }} alt="" src={exampleImg} />
      <br />
      <a href="/auth/login">
        <button style={Styles.primaryButton}>Continue</button>
      </a>
    </div>
  );
}

export default WrongCharacter;
