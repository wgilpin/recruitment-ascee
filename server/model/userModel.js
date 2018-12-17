const Model = require('./Model');
const TokenStore = require('../src/TokenStore');

class UserModel extends Model {
  constructor() {
    super();
    this.kind = 'User';
    this.addField('accessToken', Model.Types.String, false);
    this.addField('scopeToken', Model.Types.String, false);
    this.addField('refreshToken', Model.Types.String, false);
    this.addField('expires', Model.Types.Number, false);
    this.addField('image', Model.Types.String, false);
    this.addField('main', Model.Types.Number, false);
  }

  async get(id) {
    const res = super.get(id);
    this.values.accessToken = TokenStore.get(typeof this, this.id);
    return res;
  }
}

module.exports = UserModel;
