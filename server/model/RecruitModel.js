// Recruit status and handlers

const Model = require('./Model');
const Store = require('./Store');

const statuses = {
  unclaimed: 0,
  escalated: 1,
  claimed: 2,
  accepted: 3,
  rejected: 4,
  ignore: 5,
};

class RecruitModel extends Model {
  constructor() {
    super();

    // user Id of the main character is PK
    this.kind = 'Recruit';
    // recruiter who claimed this case
    this.addField('recruiter', Model.Types.Number, false);
    // senior recruiter who case was escalated to
    this.addField('escalatedTo', Model.Types.Number, false);
    this.addField('mainId', Model.Types.Number, false);
    // case status
    this.addField('status', Model.Types.Number, false, statuses.unclaimed);
    // recruiter notes
    this.addField('notes', Model.Types.String, false);
  }

  static get statuses() {
    // expose the status kinds
    return statuses;
  }

  static startWorkflow(applicantId) {
    // kick off the workflow by assigning unclaimed
    // TODO: need to check if it's there - without creating it
    // key should be applicantId
    const wf = new RecruitModel();
    return wf.get(applicantId).then(() => wf.update({ status: statuses.unclaimed }));
  }

  static async getRecruitList(recruiterId) {
    const res = {
      claimed: {},
      unclaimed: {},
      escalated: {},
    };

    // claimed cases
    let query = Store.datastore.createQuery('Recruits')
      .filter('recruiter', '=', recruiterId)
      .filter('status', '=', statuses.claimed);
    [res.claimed] = await Store.datastore.runQuery(query);

    // Escalated cases
    query = Store.datastore.createQuery('Recruits')
      .filter('recruiter', '=', recruiterId)
      .filter('status', '=', statuses.escalated);
    [res.escalated] = await Store.datastore.runQuery(query);


    // all unclaimed cases
    query = Store.datastore.createQuery('Recruits')
      .filter('status', '=', statuses.unclaimed);
    [res.unclaimed] = await Store.datastore.runQuery(query);

    // TODO: all 3 promises could be resolved together
    return res;
  }
}

module.exports = RecruitModel;