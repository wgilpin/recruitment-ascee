import React from 'react';
import DeleteImg from '../images/baseline_delete_white_24dp.png';

const styles={
  fadein: { 
    animation: 'fadein 2s',
  }
}

export default props =>
  props.images.map((image, i) => (
    <div key={i} style={styles.fadein}>
      <div
        onClick={() => props.removeImage(image.public_id)}
        className="delete"
      >
        <img src={DeleteImg} alt="delete" />
      </div>
      <img src={image.secure_url} alt="" />
    </div>
  ));
