import React from 'react';
import PropTypes from 'prop-types';
import FetchData from './FetchData';
import TableStyles from './TableStyles';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {
};

const styles = {
  ...TableStyles.styles,
  progress: {
    backgroundColor: '#444',
    color: 'cyan',
    height: '7px',
  },
}

export default class Bookmarks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'bookmarks',
      bookmarkList: {},
    };
  }

  componentDidMount() {
    new FetchData(
      { id: this.props.alt, scope: 'bookmarks' },
      this.onLoaded,
      this.onError
    ).get()
      .then(data => {
        let { info } = data;
        let newBmList = { other: { name: '[no folder]', inside: {} } };
        if (Object.keys(info).length !== Object.keys(this.state.bookmarkList || {}).length) {
          console.log('loaded bms');
          Object.keys(info).map(key => {
            if ('folder_id' in info[key]) {
              // it's a folder
              newBmList[key] = info[key];
            } else {
              // a bm not in a folder
              newBmList.other.inside[key] = info[key];
            };
          })
          this.setState({ bookmarkList: newBmList });
        };
      });
  }

  static bookmarkLine(key, idx, { item, label, location_id }) {
    if (!location_id) {
      return null;
    }
    let lineStyle =
      (idx % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    let location = `${(location_id || {}).regionName} > ${(location_id || {}).solarSystemName}`;
    let displayName = (item || {}).typeName || label;
    return (
      <div style={styles.row} key={key}>
        <div style={lineStyle}></div>
        <div style={lineStyle}>{displayName}</div>
        <div style={lineStyle}>{location}</div>
      </div>
    )
  }

  bookmarkFolder(id) {
    let folder = this.state.bookmarkList[id];
    if (folder.inside) {
      return (
        <React.Fragment>
          <div style={{ ...styles.row, ...styles.folderHeader }} key={folder.folder_id}>
            <div style={styles.cell}>&emsp;{folder.name}</div>
            <div style={styles.cell}></div>
            <div style={styles.cell}></div>
          </div>
          <div style={styles.hr} />
          {Object.keys(folder.inside).map((key, idx) => {
            return Bookmarks.bookmarkLine(key, idx, folder.inside[key]);
          })}
        </React.Fragment>
      )
    } else {
      return null;
    }
  }

  render() {
    return (
      <div style={styles.div}>
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <div style={styles.cell}>FOLDER</div>
            <div style={styles.cell}>TYPE</div>
            <div style={styles.cell}>LOCATION</div>
          </div>
          {Object.keys(this.state.bookmarkList).map((folder) => {
            return this.bookmarkFolder(folder)
          })}
        </div>
      </div>
    );
  }
}

Bookmarks.propTypes = propTypes;
Bookmarks.defaultProps = defaultProps;