import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from './TableStyles';
import expandedImg from './images/expanded.png';


const propTypes = {
  sorted: PropTypes.bool,
  label: PropTypes.string,
  onToggleSort: PropTypes.func,
};

const defaultProps = {
  sorted: false,
  label: '',
};

const styles= {
  outer: {
    ...TableStyles.styles.cell,
  },
  text: {
    ...TableStyles.styles.header,
    display: 'inline-block',
  },
  img: {
    display: 'inline-block',
    alignSelf: 'start',
    paddingTop: '9px',
    paddingLeft: '6px',

  },
}

export default class ColumnHeader extends React.Component {
  constructor(props){
    super(props);
    this.state = { sorted: false };
  }

  componentWillReceiveProps(nextProps) {
    // Any time props.email changes, update state.
    if (nextProps.sorted !== this.props.sorted) {
      this.setState({
        sorted: nextProps.sorted
      });
    }
  }

  toggleSort = () => {
    // this.setState({ sorted: !this.state.sorted });
    if (this.props.onToggleSort){
      this.props.onToggleSort(this.props.label);
    }
  }

  render() {
    return (
      <div style={styles.outer} onClick={this.toggleSort}>
        <span style={styles.text}>{this.props.label}</span>
        {this.state.sorted && (<img style={styles.img} src={expandedImg} alt="v"/>)}
      </div>
    );
  }
}

ColumnHeader.propTypes = propTypes;
ColumnHeader.defaultProps = defaultProps;