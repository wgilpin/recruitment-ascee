import React from 'react';
import PropTypes from 'prop-types';
import RoundImage from './common/RoundImage';
import walletImg from './images/wallet.png';
import assetsImg from './images/assets.png';
import mailImg from './images/evemail.png';
import skillsImg from './images/skills.png';
import blueprintImg from './images/blueprints.png';
import bookmarkImg from './images/personallocations.png';
import contractsImg from './images/contracts.png';
import calendarImg from './images/calendar.png';
import marketImg from './images/market.png';
import contactsImg from './images/contacts.png';
import PIImg from './images/planetarycommodities.png';
import fittingsImg from './images/fitting.png';
import industryImg from './images/industry.png';
import notesImg from './images/notepad.png';

const propTypes = {
  onTabChange: PropTypes.func,
};

const defaultProps = {};

const styles = {
  div: {
    display: 'grid',
    gridTemplateColumns: 'auto',
    gridTemplateRows: 'auto 32px',
    gridColumnGap: '20px',
    gridRowGap: '10px',
    justifyItems: 'center',
  },
  span: {
    color: '#01799A',
    gridRow: 2,
    fontWeight: 600,
  },
  selected: {
    textDecoration: 'underline overline',
    fontWeight: 600,
  }
};

export default class TabsHeader extends React.Component {
  constructor(props) {
    super(props);
    console.log('cons', this);
    this.state = {
      selected: null,
    };
  }

  showTab = (name) => {
    //open the tab
    console.log('tabsHeader click ');

    if (this.props.onTabChange) {
      console.log('tabsHeader click handled ');

      this.props.onTabChange(name);
      this.setState({ selected: name })
    }
  }

  build_tab_icons(col,image, name) {
    let textStyle;
    if (this.state.selected === name){
      textStyle = { gridColumn: col, ...styles.span, ...styles.selected };
    }
    else {
      textStyle = { gridColumn: col, ...styles.span }
    }
    return (
      <>
      <RoundImage style={{ gridColumn: col, gridRow: 1 }} size={40} src={image} onClick={this.showTab} name={name}/>
      <span style={textStyle} onClick={this.showTab} name={name}>{name}</span>
      </>
    )
  }

  render() {
    return (
      <div style={styles.div}>
        {this.build_tab_icons(1, notesImg, 'Notes')}
        {this.build_tab_icons(2, walletImg, 'Wallet')}
        {this.build_tab_icons(3, contactsImg, 'Contacts')}
        {this.build_tab_icons(4, assetsImg, 'Assets')}
        {this.build_tab_icons(5, skillsImg, 'Skills')}
        {this.build_tab_icons(6, bookmarkImg, 'Bookmarks')}
        {this.build_tab_icons(7, blueprintImg, 'Blueprints')}
        {this.build_tab_icons(8, mailImg, 'Mail')}
        {this.build_tab_icons(9, contractsImg, 'Contracts')}
        {this.build_tab_icons(10, calendarImg, 'Calendar')}
        {this.build_tab_icons(11, marketImg, 'Market')}
        {this.build_tab_icons(12, fittingsImg, 'Fittings')}
        {this.build_tab_icons(13, industryImg, 'Industry')}
        {this.build_tab_icons(14, PIImg, 'PI')}
      </div>
    );
  }
}

TabsHeader.propTypes = propTypes;
TabsHeader.defaultProps = defaultProps;