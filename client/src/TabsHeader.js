import React from 'react';
import PropTypes from 'prop-types';
import RoundImage from './common/RoundImage';
import walletImg from './images/wallet.png';
import assetsImg from './images/assets.png';
import mailImg from './images/evemail.png';
import skillsImg from './images/skills.png';
import blueprintImg from './images/blueprints.png';
import bookmarkImg from './images/bookmarks.png';
import contractsImg from './images/contracts.png';
import calendarImg from './images/calendar.png';
import marketImg from './images/market.png';
import contactsImg from './images/contacts.png';

const propTypes = {
  onTabChange: PropTypes.func,
};

const defaultProps = {};

const styles = {
  div: {
    width: 50 * 10,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gridTemplateRows: 'auto 32px',
    gridColumnGap: '20px',
    gridRowGap: '10px',
    margin: 'auto',
    justifyItems: 'center',
  },
  span: {
    color: '#01799A',
    gridRow: 2,
  }
};

export default class TabsHeader extends React.Component {
  constructor(props) {
    super(props);
    console.log('cons', this);
    this.state = {};
  }

  showTab = (name) => {
    //open the tab
    console.log('tabsHeader click ');

    if (this.props.onTabChange) {
      console.log('tabsHeader click handled ');

      this.props.onTabChange(name);
    }
  }

  render() {
    return (
      <div style={styles.div}>
        <RoundImage style={{ gridColumn: 2, gridRow: 1 }} size={40} src={walletImg} onClick={this.showTab} name="wallet"/>
        <span style={{ gridColumn: 1, ...styles.span }} onClick={this.showTab} name="wallet">Wallet</span>
        <RoundImage style={{ gridColumn: 3, gridRow: 1 }} size={40} src={contactsImg} onClick={this.showTab} name="contacts"/>
        <span style={{ gridColumn: 2, ...styles.span }} onClick={this.showTab} name="contacts">Contacts</span>
        <RoundImage style={{ gridColumn: 4, gridRow: 1 }} size={40} src={assetsImg} onClick={this.showTab} name="assets"/>
        <span style={{ gridColumn: 3, ...styles.span }} onClick={this.showTab} name="assets">Assets</span>
        <RoundImage style={{ gridColumn: 5, gridRow: 1 }} size={40} src={skillsImg} onClick={this.showTab} name='skills'/>
        <span style={{ gridColumn: 4, ...styles.span }} onClick={this.showTab} name="skills">Skills</span>
        <RoundImage style={{ gridColumn: 6, gridRow: 1 }} size={40} src={bookmarkImg} onClick={this.showTab} name='bookmarks'/>
        <span style={{ gridColumn: 5, ...styles.span }} onClick={this.showTab} name="bookmarks">Bookmarks</span>
        <RoundImage style={{ gridColumn: 7, gridRow: 1 }} size={40} src={blueprintImg} onClick={this.showTab} name='blueprints'/>
        <span style={{ gridColumn: 6, ...styles.span}} onClick={this.showTab} name="blueprints">Blueprints</span>
        <RoundImage style={{ gridColumn: 8, gridRow: 1 }} size={40} src={mailImg} onClick={this.showTab} name='mail'/>
        <span style={{ gridColumn: 7, ...styles.span }} onClick={this.showTab} name="mail">Mail</span>
        <RoundImage style={{ gridColumn: 9, gridRow: 1 }} size={40} src={contractsImg} onClick={this.showTab} name='contracts'/>
        <span style={{ gridColumn: 8, ...styles.span }} onClick={this.showTab} name="contracts">Contracts</span>
        <RoundImage style={{ gridColumn: 10, gridRow: 1 }} size={40} src={calendarImg} onClick={this.showTab} name='calendar'/>
        <span style={{ gridColumn: 9, ...styles.span }} onClick={this.showTab} name="calendar">Calendar</span>
        <RoundImage style={{ gridColumn: 11, gridRow: 1 }} size={40} src={marketImg} onClick={this.showTab} name='market'/>
        <span style={{ gridColumn: 10, ...styles.span }} onClick={this.showTab} name="market">Market</span>
      </div>
    );
  }
}

TabsHeader.propTypes = propTypes;
TabsHeader.defaultProps = defaultProps;