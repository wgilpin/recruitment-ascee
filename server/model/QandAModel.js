const Store = require('./Store');
const ApplicationModel = require('./ApplicationModel');
const CharacterModel = require('./CharacterModel');

class QandA {
  static async getAnswers(applicantId) {
    const query = Store.datastore.createQuery('QandA').filter('userId', '=', applicantId);
    const qa = await Store.datastore.runQuery(query);
    return qa[0];
  }

  static async addToApplications(applicantId) {
    // check if there aready
    const app = new ApplicationModel();
    if (!app.get(applicantId) || app.values.mainId === null) {
      // get the main
      const char = new CharacterModel();
      if (char.get(applicantId)) {
        app.update({
          mainId: char.values.mainId,
          name: char.values.name,
          avatar: char.values.px64x64,
        });
      } else {
        throw new Error(`addToApplications: Main not found for character ${applicantId}`);
      }
    }
  }

  static async updateQA(applicantId, qa) {
    // delete current answers
    const query = Store.datastore
      .createQuery('QandA')
      .filter('userId', '=', applicantId);
    const old = await Store.datastore.runQuery(query);
    const deletePromises = old[0].map((ans) => {
      console.log(ans);
      return Store.datastore.delete(ans[Store.datastore.KEY]);
    });
    // save the new replies
    return Promise.all(deletePromises)
      .then(() => {
        // all old ones deleted
        console.log('deleted old qa');
        const savePromises = qa.map((q) => {
          const data = { ...q, userId: applicantId };
          return Store.datastore.insert({
            key: Store.datastore.key('QandA'),
            data,
          });
        });
        return Promise.all(savePromises);
      })
      .then(() => QandA.addToApplications(applicantId))
      .catch(err => console.log('updateQA error', err));
  }

  static getCurrentQuestionList() {
    // get the SOP list, in form [{ q: 'aaaa', a: 'bbbb' }]
    const query = Store.datastore
      .createQuery('Question');
    return Store.datastore.runQuery(query).then(qs => qs[0].reduce((acc, obj) => {
      return ({
        ...acc,
        [obj[Store.datastore.KEY].id]: obj.q,
      });
    },
    {}));
  }

  static getQuestions(applicantId) {
    /*
     * get the list of current questions
     *
     * @returns Promise -> array of questions
     */
    if (applicantId === undefined) {
      return QandA.getCurrentQuestionList();
    }
    // get the list for a specified candidate
    const applicantQuery = Store.datastore
      .createQuery('QandA')
      .filter('userId', '=', applicantId);
    return Store.datastore.runQuery(applicantQuery)
      .then((data) => {
        if (data[0] && data[0].length > 0) {
          return data[0];
        }
        return QandA.getCurrentQuestionList();
      })
      .catch(err => console.log('getQuestions error', err));
  }

  static async setQuestions(questions) {
    /*
     * store an updated list of applicant questions
     *
     * @param {array} questions - list of strings
     * @returns Promise on completion
     */
    const query = Store.datastore
      .createQuery('Question');
    const old = await Store.datastore.runQuery(query);
    const deletePromises = old[0].map(ans => Store.datastore.delete(ans));
    // save the new qs
    return Promise.all(deletePromises).then(() => {
      // all old ones deleted
      const savePromises = questions
        .map(q => Store.datastore.upsert({
          key: Store.datastore.key('Question'),
          entity: { q },
        }));
      return Promise.all(savePromises);
    });
  }
}

module.exports = QandA;
