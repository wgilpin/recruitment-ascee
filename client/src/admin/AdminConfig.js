import React from 'react';
import FetchData from '../common/FetchData';
import Styles from '../common/Styles';
import TableStyles from '../TableStyles';
import Alt from '../Alt'
import EditImg from '../images/edit-white.svg';
import FindESICharacter from './FindESICharacter';


/*
api required
/api/admin/get_congig/<str:key>
*/

const styles = {
  ...TableStyles.styles,
  ...Styles.styles,
  outer: {
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}

export default class AdminConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const scope = 'admin/get_config';
    this.setState({ welcome: new FetchData({id: 'welcome_text', scope }).get() });
    this.setState({ mailUserId: new FetchData({id: 'mail_user_id', scope }).get() });
  }

  handleEditMail = () => {
    this.setState({ showFindChar: true });
  }

  updateSearchText(evt) {
    this.setState({
      searchText: evt.target.value,
    });
  }

  handleSearch() {
    new FetchData({ scope: 'character/find', param1: this.state.searchText })
      .get()
      .then(res => {
        this.setState({ searchResults: res });
      });
  }

  render() {
    return (
      <div style={styles.outer}>
        <h2 style={styles.h2}>Welcome text</h2>
        <div style={styles.text}>{this.state.welcome}</div>
        <hr style={styles.hr} />
        <h2 style={styles.h2}>Mail User</h2>
        <Alt id={this.state.mailUserId}></Alt>
        <img style={styles.editBtn} alt='edit' src={EditImg} onClick={this.handleEditMail} />
        {this.state.showFindChar && [
          <FindESICharacter
            onSelect={this.handleMove}
          />
        ]
        }
      </div>
    );
  }
}
