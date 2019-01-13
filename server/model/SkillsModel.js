const Esi = require('../src/EsiRequest');
const SkillStatic = require('./SkillStatic');
const TokenStore = require('../src/TokenStore');
const logging = require('../src/Logging');

/*
  Load the skills for a character.
*/

/* eslint-disable camelcase */
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

  async loadFromEsi() {
    // TODO: need to refresh every 24 hrs
    // esi record: { current_skill_level, skill_id, skillpoints_in_skill }
    try {
      const esiSkills = await Esi.get(Esi.kinds.Skills, this.id, this.tok);
      /* eslint-disable guard-for-in  */
      /* eslint-disable  no-restricted-syntax */
      /* eslint-disable  no-await-in-loop */
      esiSkills.body.skills.forEach((esiRecord) => {
        const { active_skill_level, skill_id, skillpoints_in_skill } = esiRecord;
        const statics = this.static.skillList[skill_id];
        const { group, name } = statics;
        // set up the group if needed
        if (!this.skills[group]) {
          this.skills[group] = {
            // name: this.static.groupList[group],
            // skillpoints_in_skill,
            // active_skill_level: current_skill_level,
          };
        }
        this.skills[group][skill_id] = { active_skill_level, name, skillpoints_in_skill };
      });
    } catch (err) {
      logging.error(`loadFromEsi ${err.message}`);
    }
  }

  addNames() {
    const res = [];
    Object.keys(this.skills).map((group_id) => {
      const groupName = this.static.groupList[group_id];
      Object.keys(this.skills[group_id]).map(async (skill_id) => {
        try {
          if (skill_id === 'skillpoints_in_skill') {
            return;
          }
          const { skillpoints_in_skill, active_skill_level } = this.skills[group_id][skill_id];
          this.skills[group_id].skillpoints_in_skill = (
            this.skills[group_id].skillpoints_in_skill || 0) + skillpoints_in_skill;
          const skillName = this.static.skillList[skill_id].name;
          const item = {
            skill_id: { groupName, name: skillName },
            active_skill_level: active_skill_level || 0,
            skillpoints_in_skill,
          };
          res.push(item);
        } catch (err) {
          logging.error(`addNames ${err.message}`);
        }
      });
      return true;
    });
    return res;
  }

  async getQueue() {
    try {
      this.queue = [];
      const esiSkillQ = await esi.characters(this.id, this.tok).skillqueue();
      if (esiSkillQ.length > 0) {
        esiSkillQ.forEach((esiRecord) => {
          const { skill_id, level_end_sp, level_start_sp } = esiRecord;
          const { name } = this.static.skillList[skill_id];
          this.queue.push({
            ...esiRecord,
            finish_date: level_end_sp,
            start_date: level_start_sp,
            skill_id: { name, id: skill_id },
          });
        });
        // sort
        this.queue.sort((a, b) => a.queue_position - b.queue_position);
        return this.queue;
      }
      return {};
    } catch (err) {
      logging.error(`loadFromEsi ${err.message}`);
      return null;
    }
  }

  async get(id) {
    this.id = parseInt(id, 10);
    this.tok = await TokenStore.get('User', id);
    await this.loadFromEsi();
    return { skills: this.addNames(), queue: await this.getQueue() };
  }
}

module.exports = SkillsModel;
