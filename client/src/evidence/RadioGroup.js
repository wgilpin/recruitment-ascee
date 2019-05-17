import React, { Component } from 'react';

const button = {
  fontSize: 'large',
  padding: '6px',
  borderRadius: '3px',
  borderStyle: 'none',
  width: '200px',
  color: 'white',
};

const styles = {
  outer: {
    display: 'table',
    margin: '12px',
  },
  selected: {
    ...button,
    backgroundColor: '#01799A',
  },
  button: {
    ...button,
    backgroundColor: '#111',
  },
};
export default class RadioGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };
  }

  render() {
    return (
      <div style={styles.outer}>
        {this.props.items.map((item, idx) => (
          <button
            style={
              this.state.selected === idx ? styles.selected : styles.button
            }
            onClick={() =>
              this.setState({ selected: idx }, () => this.props.onChange(idx))
            }
          >
            {item}
          </button>
        ))}
      </div>
    );
  }
}
