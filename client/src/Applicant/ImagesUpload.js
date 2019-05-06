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

  uploadFiles = (files, s3Data, image_id) => {
    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = "true";
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
      .then(({ info: { data, image_id } }) => {
        this.uploadFiles(files, data, image_id);
      });
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
