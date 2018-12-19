const esi = require('eve-swagger');
const SkillStatic = require('./SkillStatic');
const Store = require('./Store');
const TokenStore = require('../src/TokenStore');

/*
  Load the skills for a character
*/

class SkillsModel {
  constructor() {
    this.static = SkillStatic;
    this.skills = {};
    this.queue = [];
    /*
      { group_id : {
        skill_id : current_skill_level,
        }
      }
    */
  }

  async loadFromDb() {
    // db record: { skill_id, current_skill_level }
    console.time('load character skills from db');
    const query = Store.datastore.createQuery('CharacterSkills').filter('User', this.id);
    const entities = await Store.datastore.runQuery(query);
    const skillArray = entities[0];
    this.skills = {};
    skillArray.forEach((sk) => {
      /* eslint-disable camelcase */
      const { skill_id, current_skill_level } = sk;
      const { name, group } = this.static.skillList[skill_id];
      this.skills[group] = {
        ...this.skills[group],
        skill_id: { name, level: current_skill_level },
      };
    });
    console.timeEnd('load character skills from db');
    return skillArray.length > 0;
  }

  async loadFromEsi() {
    // TODO: need to refresh every 24 hrs
    // esi record: { current_skill_level, skill_id, skillpoints_in_skill }
    try {
      const esiSkills = await esi.characters(this.id, tok).skills();
      /* eslint-disable guard-for-in  */
      /* eslint-disable  no-restricted-syntax */
      /* eslint-disable  no-await-in-loop */
      esiSkills.skills.forEach((esiRecord) => {
        const { current_skill_level, skill_id, skillpoints_in_skill } = esiRecord;
        const { group_id, name } = SkillStatic.skillList[skill_id];
        // set up the group if needed
        if (!this.skills[group_id]) {
          this.skills[group_id] = {
            name: SkillStatic.groupList[group_id].name,
            skillpoints_in_skill,
            active_skill_level: current_skill_level,
          };
        }
        this.skills[group_id][skill_id] = { current_skill_level, name };
      });
    } catch (err) {
      console.error(`loadFromEsi ${err.message}`);
    }
  }


  async saveToDb() {
    /*
      this.skills: { group_id* : { skill_id* : current_skill_level } }
      to
      db record: { skill_id, current_skill_level }
     */
    if (this.skill === {}) {
      return false;
    }
    Object.keys(this.skills).map((group_id) => {
      Object.keys(this.skills[group_id]).map(async (skill_id) => {
        const { current_skill_level } = this.skills[group_id][skill_id];
        const data = { skill_id, current_skill_level };
        try {
          const key = Store.datastore.key({ path: ['CharacterSkills', parseInt(skill_id, 10)] });
          await Store.datastore.datastore.save({
            key,
            data,
          });
        } catch (err) {
          console.error(`Error Saving User Skill ${err}`);
        }
      });
      return true;
    });
    return true;
  }

  addNames() {
    const res = {};
    Object.keys(this.skills).map((group_id) => {
      const groupName = SkillStatic.groupList[group_id].name;
      res[groupName] = { };
      Object.keys(this.skills[group_id]).map(async (skill_id) => {
        const { current_skill_level, skillpoints_in_skill } = this.skills[group_id][skill_id];
        const skillName = SkillStatic.skillList[skill_id].name;
        res[groupName][skillName] = {
          active_skill_level: current_skill_level,
          skillpoints_in_skill,
        };
      });
      return true;
    });
    return true;
  }

  async getQueue() {
    try {
      this.queue = [];
      const esiSkillQ = await esi.characters(this.id, this.tok).skillqueue();
      /* eslint-disable  camelcase */
      esiSkillQ.skills.forEach((esiRecord) => {
        const {
          finished_level, finish_date, queue_position, skill_id, start_date,
        } = esiRecord;
        const { name } = SkillStatic.skillList[skill_id];
        this.queue.push({
          finished_level, finish_date, queue_position, skill_id, start_date, name,
        });
        // sort
        this.queue.sort((a, b) => a.queue_position - b.queue_position);
        return this.queue;
      });
    } catch (err) {
      console.error(`loadFromEsi ${err.message}`);
    }
  }

  async get(id) {
    this.id = id;
    this.tok = await TokenStore.get('User', id);

    if (await this.loadFromDb()) {
      return this.addNames();
    }
    await this.loadFromEsi();
    await this.saveToDb();
    return { skills: this.addNames(), queue: this.getQueue() };
  }
}

module.exports = SkillsModel;
