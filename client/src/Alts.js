import React from 'react';
import PropTypes from 'prop-types';
import Alt from './Alt';
import FetchData from './common/FetchData';

const propTypes = {
  onAltSelect: PropTypes.func,
  main: PropTypes.number,
  childrenTop: PropTypes.bool,
  highlightMain: PropTypes.bool,
  showPointer: PropTypes.bool,
  style: {},
};

const defaultProps = {
  main: null,
  childrenTop: false,
  highlightMain: false,
  showPointer: false,
};

const styles = {
  outer: {
    height: '100%',
    position: 'relative',
    textAlign: 'left',
    padding: '8px',
  },
  div: {
    display: 'block',
  },
  hr: {
    borderColor: '#555',
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#01799A',
    marginBottom: '6px',
  },
  corporation: {
    width: '100px',
  },
  secStatus: {
    fontWeight: 500,
  }
};
export default class Alts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alts: props.alts };
  }

  handleClick = alt => {
    console.log('alts click ', alt);
    this.setState({ selected: alt });
    if (this.props.onAltSelect) {
      this.props.onAltSelect(alt);
    }
  };

  loadCharacterSummary= (alts) => {
    Object.entries(alts).map(([id, alt]) => {
      return new FetchData({ id, scope: 'character', param2: 'summary' })
        .get()
        .then(({info}) => this.setState({
          corporation: info.corporation_name,
          alliance: info.alliance_name,
          secStatus: info.security_status,
        }));
    })
  }

  componentDidMount() {
    new FetchData({ id: this.props.main, scope: 'user/characters' })
      .get()
      .then(data => {
        let mainData;
        if (this.props.highlightMain) {
          mainData = data.info[this.props.main];
          delete data.info[this.props.main];
        }
        this.setState({ alts: data.info, main: mainData });
        this.loadCharacterSummary(data.info);
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const hasAlts = Object.keys(this.state.alts || {}).length > 0;
    return (
      <div style={{...styles.outer, ...this.props.style }}>
        {this.props.childrenTop && this.props.children}
        <hr style={styles.hr} />
        {this.props.highlightMain && this.state.main && <>
          <div style={styles.sectionTitle}>Main</div>
          <Alt
              style={styles.div}
              name={this.state.main.name}
              id={this.props.main}
              selected={this.state.selected === this.props.main}
              onClick={this.handleClick}
              showPointer={this.props.showPointer}
            />
            <div>
              <span style={styles.corporation}>{this.state.corporation}</span>
              <span style={styles.secStatus}>({this.state.secStatus})</span>
            </div>
            <hr style={styles.hr} />
        </>}
        {hasAlts && <div style={styles.sectionTitle}>Alts</div>}
        {Object.keys(this.state.alts || {}).map(key => {
          const alt = this.state.alts[key];
          return (
            <Alt
              style={styles.div}
              name={alt.name}
              id={key}
              selected={this.state.selected === key}
              onClick={this.handleClick}
            />
          );
        })}
        {!this.props.childrenTop && this.props.children}
        {hasAlts &&
          <hr style={styles.hr} />}
      </div>
    );
  }
}

Alts.propTypes = propTypes;
Alts.defaultProps = defaultProps;
