const Model = require('./Model');

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
}

module.exports = UserModel;
