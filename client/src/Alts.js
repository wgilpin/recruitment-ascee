import React from 'react';
import PropTypes from 'prop-types';
import Alt from './Alt';
import FetchData from './FetchData';

const propTypes = {
  onAltSelect: PropTypes.func,
  main: PropTypes.number,
};

const defaultProps = {
  main: null,
};

const styles = {
  outer: {
    height: '100%',
  },
  div: {
    display: 'block',
  },
  hr: {
    borderColor: '#555',
  },
};
export default class Alts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alts: props.alts };
  }

  handleClick = alt => {
    console.log('alts click ', this.props.onAltSelect.alt);
    this.setState({ selected: alt });
    if (this.props.onAltSelect) {
      this.props.onAltSelect(alt);
    }
  };

  componentDidMount() {
    let fetch = new FetchData({ id: this.props.main, scope: 'character/alts' });
    fetch
      .get()
      .then(data => {
        console.log(data);
        if (data.error === 'login') {
          window.location = '/app';
          return;
        }
        this.setState({ alts: data.info });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div style={styles.outer}>
        <hr style={styles.hr} />
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
        <hr style={styles.hr} />
      </div>
    );
  }
}

Alts.propTypes = propTypes;
Alts.defaultProps = defaultProps;
