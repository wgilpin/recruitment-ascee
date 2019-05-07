import React from 'react';
import Loader from 'react-loader-spinner';
import Images from './Images';
import FetchData from '../common/FetchData';
import styles from './ApplicantStyles';

export default class ImagesUpload extends React.Component {
  state = {
    uploading: false,
    images: [],
  };

  onChange = e => {
    const files = Array.from(e.target.files);
    this.setState({ uploading: true }, () => {
      new FetchData({}).upload_to_server(files, () => {
        this.setState({ uploading: false });
      });
    });
  };

  render() {
    const { uploading, images } = this.state;

    if (uploading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }

    return (
      <div>
        <h2 style={styles.heading}>Upload Character Selection Screenshots</h2>
        <p>
          For ALL of your accounts, take a screenshot, save it then upload them
          all here.
        </p>
        <div className="buttons">
          <Images onChange={this.onChange} removeImage={this.removeImage} />
        </div>
      </div>
    );
  }
}
