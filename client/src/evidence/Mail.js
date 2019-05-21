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

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  iconBtn: {
    width: '60px',
    float: 'left',
  },
  gridOuter: {
    display: 'grid',
    gridTemplateColumns: '200px 300px auto',
  },
  gridCell: {
    fontWeight: 800,
    textAlign: 'left',
    color: TableStyles.styles.themeColor.color,
  },
  body: {
    textAlign: 'left',
    gridColumn: '1/4',
  },
};

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
    new FetchData({
      id: this.props.targetId,
      scope: 'character',
      param1: 'mail',
    })
      .get(this.state.lastMailId ? { last_mail_id: this.state.lastMailId } : {})
      .then(data => {
        // got the list of mail headers
        newList = Mail.jsonToMailList(data);
        this.setState({ lastMailId: newList[newList.length - 1].mail_id });
        if (!this.state.endPageOneId) {
          this.setState({ endPageOneId: newList[newList.length - 1].mail_id });
        }
      })
      .then(() => {
        const sortedMailList = newList
          .map(item => ({ ...item, collapsed: true }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.setState({ mailList: sortedMailList, loading: false });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false });
      });
  };

  badlyRemoveFontSizeColor(html) {
    let small = html.replace(/<font size=['"]\d*['"]/g, '<font size="unset"');
    small = small.replace(/color=['"]#?[0-9a-zA-Z]*['"]/g, 'color="white"');
    small = small.replace(/<a /g, '<a style="color: cyan"');
    return small + '<hr/>';
  }

  processLinks(links, body) {
    /* Given a list of text values for links, from this.findLinks(),
     *  replace the links with the text
     */
    if (!links) {
      return body;
    }
    let markup;
    links.forEach(link => {
      let lookupRegex = new RegExp(`${link.itemId}">([\\w\\s]+)<`, 'g');
      if ('type' in (link || {})) {
        if (link.type === 'character') {
          markup = `${link.data.corporation_ticker}`;
          markup += link.data.alliance_ticker
            ? ` / ${link.data.alliance_ticker}`
            : '';
        }
      } else {
        markup = link.data.system_name;
      }
      body = body.replace(lookupRegex, `${link.itemId}">$1 [${markup}]<`);
    });
    return body;
  }

  toggleMessage = idx => {
    // toggle message body visibility, loading if needed
    let { mailList } = this.state;
    let thisMail = mailList[idx];
    let rawBody;
    const updatedMailList = mailList.slice(0);
    updatedMailList[idx] = { ...thisMail, collapsed: !thisMail.collapsed };
    this.setState({ mailList: updatedMailList });
    if (!thisMail.body) {
      return new FetchData({
        id: this.props.targetId,
        scope: 'character',
        param1: 'mail',
        param2: thisMail.mail_id,
      })
        .get()
        .then(body => {
          rawBody = this.badlyRemoveFontSizeColor(body);
        })
        .then(links => this.processLinks(links, rawBody))
        .then(body => {
          const updatedMailList = mailList.slice(0);
          updatedMailList[idx] = { ...thisMail, collapsed: false, body };
          this.setState({ mailList: updatedMailList });
        });
    }
  };

  showFirst = () => {
    this.setState(
      {
        lastMailId: null,
        loading: true,
      },
      this.componentDidMount
    );
  };

  showMore = () => this.setState({ loading: true }, this.componentDidMount);

  renderMailItem(line, msgId) {
    const {
      timestamp,
      from,
      from_name,
      recipients,
      subject,
      is_read,
      redlisted,
      collapsed,
      body,
    } = line;
    // },
    // msgId) {
    let lineStyle, formattedDate;
    let readStyle = is_read ? styles.isRead : styles.isUnread;

    lineStyle = msgId % 2 === 0 ? styles.isOdd : {};
    lineStyle = {
      ...lineStyle,
      ...readStyle,
      textAlign: 'left',
      fontWeight: 600,
    };
    formattedDate = moment(timestamp).format('DD-MMM-YYYY HH:MM');
    let nameStyle = { ...lineStyle };
    const { recipient_name } = recipients[0];
    let otherParty = from_name;
    let mailSubject = subject;
    if (this.props.targetId === from.toString()) {
      otherParty = `TO: ${recipient_name}`;
      mailSubject = `${otherParty}>${subject}`;
    }
    if (redlisted.indexOf('from_name') > -1) {
      nameStyle = { ...lineStyle, ...styles.redList };
    }
    const doClick = () => this.toggleMessage(msgId);
    return [
      <div style={{ ...lineStyle, gridColumn: 1 }} onClick={doClick}>
        {formattedDate}
      </div>,
      <div style={{ ...nameStyle, gridColumn: 2 }} onClick={doClick}>
        {otherParty}
      </div>,
      <div style={{ ...lineStyle, gridColumn: 3 }} onClick={doClick}>
        {mailSubject}
      </div>,
      !collapsed && (
        <div style={styles.body} dangerouslySetInnerHTML={{ __html: body }} />
      ),
    ];
  }
  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    if (this.state.mailList.length === 0) {
      return <div>No Mail</div>;
    }
    return (
      <div style={styles.gridOuter}>
        <div style={{ ...styles.gridCell, gridColumn: 1 }}>DATE</div>
        <div style={{ ...styles.gridCell, gridColumn: 2 }}>WITH</div>
        <div style={{ ...styles.gridCell, gridColumn: 3 }}>SUBJECT</div>
        {Object.keys(this.state.mailList).map((line, idx) => {
          return this.renderMailItem(this.state.mailList[line], idx);
        })}
        <div>
          {this.state.lastMailId !== this.state.endPageOneId && (
            <IconBtn
              src={FirstPageImg}
              alt="first"
              onClick={this.showFirst}
              label="First"
              style={styles.iconBtn}
            />
          )}
          <IconBtn
            src={NextPageImg}
            alt="next"
            onClick={this.showMore}
            label="Next"
            style={styles.iconBtn}
          />
        </div>
      </div>
    );
  }
}

Mail.propTypes = propTypes;
Mail.defaultProps = defaultProps;
