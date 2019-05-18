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

  onUploadError = (e) => {
    this.setState({ uploading: false });
    console.log('Image Storage Failed', e);
    window.alert('Image Storage Failed');
  };

  onChange = e => {
    const files = Array.from(e.target.files);
    this.setState({ uploading: true }, () => {
      new FetchData({}).upload_to_server(
        files,
        () => {
          this.setState({ uploading: false });
        },
        () => this.onUploadError(e),
      );
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
          For ALL of your accounts, take a screenshot, save it then upload them here.
        </p>
        <div style={styles.padded}>
          <label
            style={styles.label}
            data-tip="Check here when you have added all you login screens"
          >
            I have added login screenshots for ALL accounts&emsp;
            <input
              style={styles.checkbox}
              type="checkbox"
              onClick={this.props.onImagesDone}
              checked={this.props.imagesDone}
            />
          </label>
        </div>
        <div className="buttons">
          <Images
            onChange={this.onChange}
            removeImage={this.removeImage}
            canDelete={this.props.canDelete}
            onChangeCount={this.props.onChangeCount}
          />
        </div>
      </div>
    );
  }
}
