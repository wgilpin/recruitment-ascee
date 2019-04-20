import React from 'react';
import Loader from 'react-loader-spinner';
import Images from './Images';
import Buttons from './Buttons';
import FetchData from '../common/FetchData';
import styles from './ApplicantStyles';
import LoginImg from '../images/LoginScreen.png';

export default class ImagesUpload extends React.Component {
  state = {
    uploading: false,
    images: [],
  };

  uploadFiles = (files, s3Data, url, image_id) => {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', s3Data.url);

    var postData = new FormData();
    for (let key in s3Data.fields) {
      postData.append(key, s3Data.fields[key]);
    }
    files.forEach((file, i) => {
      postData.append(i, file);
    });

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 204) {
          new FetchData({ scope: 'user/confirm_s3/', id: image_id })
            .put()
            .then(() =>
              this.setState({
                uploading: false,
              })
            );
        } else {
          alert('Could not upload file.');
        }
      }
    };
    xhr.send(postData);
  };

  getSignedRequest = files => {
    new FetchData({ scope: 'user/sign_s3' })
      .put()
      .then(({ info: { data, url, image_id } }) => {
        this.uploadFiles(files, data, url, image_id);
      });
  };

  onChange = e => {
    const files = Array.from(e.target.files);
    this.setState({ uploading: true }, () => this.getSignedRequest(files));
  };

  removeImage = id => {
    this.setState({
      images: this.state.images.filter(image => image.public_id !== id),
    });
  };

  render() {
    const { uploading, images } = this.state;

    const content = () => {
      switch (true) {
        case uploading:
          return <Loader />;
        case images.length === 0:
          return (
            <React.Fragment>
              <p>For example</p>
              <img style={{ width: '200px' }} src={LoginImg} alt="" />
              <Buttons onChange={this.onChange} />
            </React.Fragment>
          );
        case images.length > 0:
          return (
            <React.Fragment>
              <Buttons onChange={this.onChange} />;
              <Images images={images} removeImage={this.removeImage} />;
            </React.Fragment>
          );
        default:
          return <Buttons onChange={this.onChange} />;
      }
    };

    return (
      <div>
        <h2 style={styles.heading}>Upload Character Selection Screenshots</h2>
        <p>
          For ALL of your accounts, take a screenshot, save it then upload them
          all here.
        </p>
        <div className="buttons">{content()}</div>
      </div>
    );
  }
}
