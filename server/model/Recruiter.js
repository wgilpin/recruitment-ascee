const Model = require('./Model');

class RecruiterModel extends Model {
  constructor() {
    super();
    this.kind = 'User';
    this.addField('userId', Model.Types.Number, false);
    this.addField('isAdmin', Model.Types.Boolean, false, false);
  }
}

module.exports = RecruiterModel;
