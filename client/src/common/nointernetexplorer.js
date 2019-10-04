import React from 'react';
import Styles from '../Applicant/ApplicantStyles';
import styles from './../Applicant/ApplicantStyles';

function nointernetexplorer() {
  var IEB = /*@cc_on!@*/false || !!document.documentMode; //detects if the browser is internet explorer
  if (IEB == true)  {
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
        Internet explorer is not supported
      </h1>
      <p>
        Our website does not support internet explorer. Please use another browser like Chrome or Firefox.
      </p>
      <img style={{ width: '400px' }} alt="" src={exampleImg} />
      <br />
    </div>
  );
}
}
export default nointernetexplorer;