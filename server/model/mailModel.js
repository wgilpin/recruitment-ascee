const esi = require('eve-swagger');
const Character = require('./CharacterModel');

class mailModel {
  static async getMailList(userId, token) {
    const mail = await esi.characters(userId, token).mail();
    // Mail(esi, userId, token);
    // .Mail.inbox();

    // load the names
    // eslint-disable-next-line no-restricted-syntax
    for (const msg of mail) {
      msg.from = Character.get(msg.from);

      // eslint-disable-next-line no-restricted-syntax
      for (const recipient of mail.recipients) {
        recipient.to = Character.get(recipient.recipient_id);
      }
    }
  }
}

module.exports = mailModel;
