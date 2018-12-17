const Model = require('./Model');

class NewUserModel extends Model {
  constructor() {
    super();
    this.kind = 'User';
    this.addField('userName', Model.String);
    this.addField('accessToken', Model.String);
    this.addField('refreshToken', Model.String, false);
    this.addField('expires', Date, false);
    this.addField('image', Model.String, false);
    this.addField('main', Model.String);
    this.addField('hasScopes', Model.Boolean, true, false);
  }
}

module.exports = NewUserModel;
