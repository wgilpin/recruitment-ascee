
import React from 'react';
import exampleImg from '../images/auth.png';
import Styles from '../Applicant/ApplicantStyles';
import styles from './../Applicant/ApplicantStyles';
var ifIE = /*@cc_on!@*/false || !!document.documentMode
function noIE() {
if (ifIE == true) {
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
        Internet Explorer not Supported
      </h1>
      <p>
        Internet Explorer is not detected please use another browser
      </p>
      <img style={{ width: '400px' }} alt="" src={exampleImg} />
      <br />
      <a href="/auth/login">
        <button style={Styles.primaryButton}>Continue</button>
      </a>
    </div>
  );
}}

export default noIE;