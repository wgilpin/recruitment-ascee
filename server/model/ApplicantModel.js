const Model = require('./Model');

const ApplicantStatus = { new: 'New', approved: 'Approved', rejected: 'Rejected' };

class ApplicantModel extends Model {
  constructor() {
    super();
    this.kind = 'User';
    this.addField('userId', Model.Types.Number);
    this.addField('status', Model.Types.String, true, ApplicantStatus.new);
  }
}

module.exports = ApplicantModel;
