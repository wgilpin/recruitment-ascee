import React from 'react';
import FetchData from '../common/FetchData';
import Styles from '../common/Styles';
import TableStyles from '../evidence/TableStyles';
import Alt from '../common/Alt'
import Confirm from '../common/Confirm';


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
  alt:{
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  }
}
const templateKinds = {
  invite: 'Invitation Template',
  reject: 'Rejection Template',
}

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
    };
    this.mailTemplate = React.createRef();
    this.mailSubject = React.createRef();
    this.mailKind = React.createRef();
  }

  componentDidMount() {
    new FetchData({ scope: 'mail/get_character' })
      .get()
      .then(({ info: { id, name }}) =>{
        this.setState({ mailCharacterId: id, mailCharacterName: name })
      })
    this.handleSelectTemplate();
  }

  handleSelectTemplate = () => {
    const kind = this.mailKind.current.value;
    new FetchData({ scope: `mail/template/${kind}` })
      .get()
      .then(({ info: { subject, text }}) =>{
        this.setState({
          mailKind: kind,
          mailSubject: subject,
          mailTemplate: text,
          dirtyMailTemplate: false,
        })
      })
  }

  doConfirmed = () => {
    window.location ='/api/mail/set_character';
  }

  handleSaveTemplate = () => {
    const template = {
      name: this.mailKind.current.value,
      subject: this.mailSubject.current.value,
      template: this.mailTemplate.current.value,
    }
    new FetchData({ scope: 'mail/template' })
      .put(template)
      .then (() => this.setState({ dirtyMailTemplate: false }))
  }

  handleEditTemplate = () => {
    this.setState({
      mailTemplate: this.mailTemplate.current.value,
      mailSubject: this.mailSubject.current.value,
      dirtyMailTemplate:
        this.mailTemplate.current.value.length > 0 &&
        this.mailSubject.current.value.length > 0,
    });
  }

  handleEditMail = () => this.setState({ showConfirm: true });

  render() {
    return [
      <div style={styles.outer}>
        <h2 style={styles.h2}>Mail User</h2>
        {this.state.mailCharacterId &&
          <Alt
            style={styles.alt}
            id={this.state.mailCharacterId}
            name={this.state.mailCharacterName}
          />
        }
        <button style={{ ...styles.secondaryButton, color: 'white'}} onClick={this.handleEditMail}>
          Edit
        </button>
        <hr style={styles.hr} />
        <h2 style={styles.h2}>Mail Template</h2>
        <select
          placeholder="Purpose"
          ref={this.mailKind}
          style={styles.input}
          onChange={this.handleSelectTemplate}
        >
          {Object.entries(templateKinds).map(([key, val]) => (
            <option
              value={key}
              selected={this.state.mailKind === key}>
                {val}
              </option>
          ))}
        </select>
        <div>
          <input
            style={styles.input}
            placeholder="  Subject Line"
            value={this.state.mailSubject}
            ref={this.mailSubject}
            onChange={this.handleEditTemplate}
          />
        </div>
        <textarea
          style={styles.textarea}
          value={this.state.mailTemplate}
          ref={this.mailTemplate}
          onChange={this.handleEditTemplate} />
        {this.state.dirtyMailTemplate &&
          <button style={styles.primaryButton} onClick={this.handleSaveTemplate}>
            Save
          </button>
        }
      </div>,
      this.state.showConfirm &&
        <Confirm
          text={`You will now be asked to log in the character you want to be the mail sender.
                This character needs to already have admin permission.` }
          onConfirm={this.doConfirmed}
          onClose={() => this.setState({ showConfirm: false })}
        />
    ];
  }
}
