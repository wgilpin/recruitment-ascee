const esi = require('eve-swagger');

class mailModel {
  static getMailList(userId, token) {
    const mail = esi.characters(userId, token).Mail;
    return mail.all();
  }
}

module.exports = mailModel;
