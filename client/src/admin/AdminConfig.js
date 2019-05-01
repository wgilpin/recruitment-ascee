import React from 'react';
import FetchData from '../common/FetchData';
import Styles from '../common/Styles';
import TableStyles from '../evidence/TableStyles';
import Alt from '../common/Alt';
import Confirm from '../common/Confirm';
import Alert from '../common/Alert';

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
  textarea: {
    width: '300px',
    height: '300px',
    backgroundColor: '#111',
    color: 'white',
    margin: '8px',
    padding: '8px',
  },
  hr: {
    ...TableStyles.hr,
    color: 'grey',
    width: '350px',
  },
  input: {
    padding: '8px',
    margin: '8px',
    width: '300px',
    backgroundColor: '#111',
    color: 'white',
    height: '24px',
    borderWidth: '1px',
    borderColor: 'grey',
  },
  alt: {
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};
const templateKinds = {
  invite: 'Invitation Template',
  reject: 'Rejection Template',
};

export default class AdminConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mailCharacterId: null,
      mailCharacterName: '',
      mailTemplate: '',
      mailSubject: '',
      showConfirm: false,
      dirtyMailTemplate: false,
      mailKind: '',
    };
  }

  componentDidMount() {
    this.loadConfig();
    this.loadTemplate();
  }

  doFetch = (scope, params) => new FetchData(scope).get(params);

  loadConfig = () => {
    const fetcher = this.props.fetcher || this.doFetch;
    new fetcher({ scope: 'mail/get_character' })
      .then(({ info: { id, name } }) => {
        this.setState({ mailCharacterId: id, mailCharacterName: name });
      });
  }

  loadTemplate = e => {
    const fetcher = this.props.fetcher || this.doFetch;
    const kind = e ? e.target.value : Object.keys(templateKinds)[0];
    new fetcher({ scope: `mail/template/${kind}` })
      .then(({ info: { subject, text } }) => {
        console.log('loadTemplate',subject, text, kind);
        
        this.setState({
          mailKind: kind,
          mailSubject: subject,
          mailTemplate: text,
          dirtyMailTemplate: false,
        });
      });
  };

  doConfirmed = () => {
    window.location = '/api/mail/set_character';
  };

  handleSaveTemplate = () => {
    const template = {
      name: this.state.mailKind,
      subject: this.state.mailSubject,
      template: this.state.mailTemplate,
    };
    new FetchData({ scope: 'mail/template' })
      .put(template)
      .then(() =>
        this.setState({ dirtyMailTemplate: false, showSavedAlert: true })
      );
  };

  handleEditTemplate = e => {
    console.log('handleEditTemplate ', e.target.value);
    const newState = {
      dirtyMailTemplate:
        e.target.value.length > 0 &&
        this.state.mailSubject.length > 0,
    }
    const changedField = e.target.type === 'text' ? 'mailSubject' : 'mailTemplate';
    newState[changedField] = e.target.value;
    this.setState(newState);
  };

  handleEditMail = () => this.setState({ showConfirm: true });

  render() {
    return [
      <div style={styles.outer}>
        <h2 style={styles.h2}>Mail User</h2>
        {this.state.mailCharacterId && (
          <Alt
            style={styles.alt}
            id={this.state.mailCharacterId.toString()}
            name={this.state.mailCharacterName}
          />
        )}
        <button
          style={{ ...styles.secondaryButton, color: 'white' }}
          onClick={this.handleEditMail}
        >
          Edit
        </button>
        <hr style={styles.hr} />
        <h2 style={styles.h2}>Mail Template</h2>
        <select
          placeholder="Purpose"
          style={{ ...styles.input, height: 'unset' }}
          onChange={this.loadTemplate}
          value={this.state.mailKind}
        >
          {Object.entries(templateKinds).map(([key, val]) => (
            <option value={key} >
              {val}
            </option>
          ))}
        </select>
        <div>
          <input
            style={styles.input}
            placeholder="  Subject Line"
            value={this.state.mailSubject}
            onChange={this.handleEditTemplate}
          />
        </div>
        <textarea
          style={styles.textarea}
          value={this.state.mailTemplate}
          onChange={this.handleEditTemplate}
        />
        {this.state.dirtyMailTemplate && (
          <button
            style={styles.primaryButton}
            onClick={this.handleSaveTemplate}
          >
            Save
          </button>
        )}
      </div>,
      this.state.showConfirm && (
        <Confirm
          text={
            'You will now be asked to log in the character you want to be the mail sender.'
          }
          onConfirm={this.doConfirmed}
          onClose={() => this.setState({ showConfirm: false })}
        />
      ),
      this.state.showSavedAlert && (
        <Alert
          text="Saved"
          onClose={() => this.setState({ showSavedAlert: false })}
        />
      ),
    ];
  }
}
