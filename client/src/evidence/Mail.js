import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from '../common/FetchData';
import TableStyles from './TableStyles';
import FirstPageImg from '../images/first_page_white.png';
import NextPageImg from '../images/chevron_right.png';
import IconBtn from '../common/IconBtn';
import moment from 'moment';

const propTypes = {
  alt: PropTypes.string,
  mailList: PropTypes.array,
};

const defaultProps = {
};

const styles = {
  ...TableStyles.styles,
  isRead: {
    fontWeight: 'normal',
  },
  isUnread: {
    fontWeight: 'bold',
  },
  body: {
    textAlign: 'left',
    color: 'white',
    fontStyle: 'italic',
    a: { color: 'white' },
    paddingLeft: '60px',
    width: '120%',
  },
  redList: {
    fontWeight: 600,
    color: 'red',
  },
  iconBtn: {
    width: '60px',
    float: 'left',
  }
}

export default class Mail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mailList: [],
      loading: true,
      lastMailId: null,
      endPageOneId: null,
    };
  }

  static jsonToMailList(json) {
    let list = [];
    if (json && json.info) {
      for (let we in json.info) {
        list.push(json.info[we]);
      }
    }
    return list;
  }

  componentDidMount = () => {
    let newList;

    // get the mail headers by API
    new FetchData(
      { id: this.props.targetId, scope: 'character', param1: 'mail' },
    ).get(this.state.lastMailId ? { last_mail_id: this.state.lastMailId} : {})
      .then(data => {
        // got the list of mail headers
        newList = Mail.jsonToMailList(data);
        this.setState({ lastMailId: newList[newList.length-1].mail_id });
        if (! this.state.endPageOneId) {
          this.setState({ endPageOneId: newList[newList.length-1].mail_id });
        }
      })
      .then(() => {
        const sortedMailList = newList
          .map(item => ({ ...item, collapsed: true }))
          .sort((a,b) => (new Date(b.timestamp) - new Date(a.timestamp)))
        this.setState({ mailList: sortedMailList, loading: false })
      })
      .catch((err) => {
        console.error(err);
        this.setState({ loading: false })
      })
  }

  badlyRemoveFontSizeColor(html) {
    let small = html.replace(/<font size=['"]\d*['"]/g, '<font size="unset"');
    small = small.replace(/color=['"]#?[0-9a-zA-Z]*['"]/g, 'color="white"');
    small = small.replace(/<a /g, '<a style="color: cyan"');
    return small + '<hr/>';
  }

  findLinks(body, linksList) {
    /* Trawl through the body for CCP links
     *  These are of the form showinfo:<typeId>//<itemId>
     *  Then fetch the text from the API for each of them
     */
    let regexp = /showinfo:(\d+)\/\/(\d+)">([\w\s]+)</g
    let matches;
    // eslint-disable-next-line no-cond-assign
    while(matches = regexp.exec(body)){
      linksList.push({ typeId: matches[1], itemId: matches[2] });
    }
    if (linksList.length === 0){
      return null;
    }
    let encodedList = encodeURIComponent(JSON.stringify(linksList));
    return new FetchData({ scope: 'link', id: this.props.targetId, param1: encodedList }).get();
  }

  processLinks(links, body){
    /* Given a list of text values for links, from this.findLinks(),
     *  replace the links with the text
     */
    if (!links){
      return body;
    };
    let markup;
    links.forEach(link => {
      let lookupRegex = new RegExp(`${link.itemId}">([\\w\\s]+)<`, 'g');
      if ('type' in (link || {})){
        if (link.type === 'character'){
          markup = `${link.data.corporation_ticker}`;
          markup += link.data.alliance_ticker ? ` / ${link.data.alliance_ticker}` : '';
        }
      } else {
        markup = link.data.system_name;
      };
      body = body.replace(lookupRegex, `${link.itemId}">$1 [${markup}]<`);
    });
    return body;
  }

  toggleMessage = (idx) => {
    // toggle message body visibility, loading if needed
    let linksList = [];
    let { mailList } = this.state;
    let thisMail = mailList[idx];
    let rawBody;
    const updatedMailList = mailList.slice(0);
    updatedMailList[idx] = { ...thisMail, collapsed: !thisMail.collapsed };
    this.setState({ mailList: updatedMailList });
    if (!thisMail.body) {
      return new FetchData(
        { id: this.props.targetId, scope: 'character', param1: 'mail', param2: thisMail.mail_id },
      ).get()
        .then((body) => {
          rawBody = this.badlyRemoveFontSizeColor(body);
          this.findLinks(rawBody, linksList)
        })
        .then(links => this.processLinks(links, rawBody))
        .then((body) => {
          const updatedMailList = mailList.slice(0);
          updatedMailList[idx] = { ...thisMail, collapsed: false, body };
          this.setState({ mailList: updatedMailList });
        })
    }
  };


  mailItem(key, { timestamp, from_name, subject, is_read, redlisted }) {
    // a react item
    let lineStyle, formattedDate;
    let readStyle = is_read ? styles.isRead : styles.isUnread;

    lineStyle = (key % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...readStyle, ...styles.cell };
    let newdate = new Date(timestamp);
    formattedDate = moment(timestamp).format('DD-MMM-YYYY HH:MM')
    let nameStyle = {...lineStyle};
    if (redlisted.indexOf('from_name') > -1) {
      nameStyle = { ...lineStyle, ...styles.redList };
    }
    return (
      <div key={key} style={styles.row} onClick={() => this.toggleMessage(key)}>
        <div style={lineStyle}>{formattedDate}</div>
        <div style={nameStyle}>{from_name}</div>
        <div style={lineStyle}>{subject}</div>
      </div>
    );
  }

  mailBody = (line) => {
    return (
      !this.state.mailList[line].collapsed &&
      (<div style={styles.row}>
        <div
          style={styles.body }
          dangerouslySetInnerHTML={{ __html: this.state.mailList[line].body }}
        />
      </div>
      )
    )
  }

  showFirst = () => {
    this.setState({
      lastMailId: null,
      loading: true,
    },
      this.componentDidMount,
    )
  }

  showMore = () => this.setState({ loading: true }, this.componentDidMount);

  render() {
    if (this.state.loading) {
      return(
      <Loader
        type="Puff"
        color="#01799A"
        height="100"
        width="100"
      />)
    }
    if (this.state.mailList.length === 0){
      return <div>No Mail</div>
    }
    return (
      <div style={styles.table}>
        <div style={styles.header}>
          <div style={styles.cell}>DATE</div>
          <div style={styles.cell}>FROM</div>
          <div style={styles.cell}>SUBJECT</div>
        </div>
        {Object.keys(this.state.mailList).map((line, idx) => {
          return (
            <React.Fragment>
              {this.mailItem(idx, this.state.mailList[line])}
              {this.mailBody(line)}
            </React.Fragment>
          );
        })
        }
        <div>
          {this.state.lastMailId !== this.state.endPageOneId &&
            <IconBtn
              src={FirstPageImg}
              alt="first"
              onClick={this.showFirst}
              label="First"
              style={styles.iconBtn}
            />
          }
          <IconBtn
            src={NextPageImg}
            alt="next"
            onClick={this.showMore}
            label="Next"
            style={styles.iconBtn}
          />
        </div>
      </div>
    )
  }
}

Mail.propTypes = propTypes;
Mail.defaultProps = defaultProps;