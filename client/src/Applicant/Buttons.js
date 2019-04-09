import React from 'react';
import ImageBtn from '../images/image.png';
import ImagesBtn from '../images/images.png';
import TableStyles from '../evidence/TableStyles';

const styles = {
  ...TableStyles.styles,
  fadein: {
    animation: 'fadein 2s',
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    height: '75vh',
  },
  hidden: {
    visibility: 'hidden',
    width: 0,
  },
  centre: {
    width: '200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '24px',
  },
  button: {
    ...TableStyles.styles.cell,
    textAlign: 'center',
    cursor: 'pointer',
  },
  outer: {
    ...TableStyles.styles.table,
    marginTop: '24px',
  },
};

export default props => (
  <div style={{ ...styles.table, ...styles.centre }}>
    <div style={{ ...styles.fadein, ...styles.row }}>
      <div style={styles.button}>
        <label htmlFor="single">
          <img src={ImageBtn} alt="" style={{cursor: 'pointer'}} />
        </label>
        <input
          type="file"
          id="single"
          onChange={props.onChange}
          style={styles.hidden}
        />
      </div>

      <div style={styles.button}>
        <label htmlFor="multi">
          <img src={ImagesBtn} alt="" style={{cursor: 'pointer'}} />
        </label>
        <input
          type="file"
          id="multi"
          onChange={props.onChange}
          multiple
          style={styles.hidden}
        />
      </div>
    </div>
    <div style={{ ...styles.fadein, ...styles.row }}>
      <div style={styles.button}>Upload Single Image</div>
      <div style={styles.button}>Upload Multiple Images</div>
    </div>
  </div>
);
