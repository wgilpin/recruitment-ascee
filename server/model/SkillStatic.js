const esi = require('eve-swagger');
const Store = require('./Store');


class SkillStatic {
  constructor() {
    this.skillList = {};
    // skill_id: { name, group_id }
    this.groupList = {};
    // groupId: { name }
  }

  async loadSkillsfromEsi() {
    const category = await esi.types.categories(16).info();
    /* eslint-disable guard-for-in  */
    /* eslint-disable  no-restricted-syntax */
    /* eslint-disable  no-await-in-loop */
    for (const groupId in category.groups) {
      const group = await esi.types.groups(category.groups[groupId]).info();
      const groupData = {};

      for (const skillId in group.types) {
        try {
          const skill = await esi.types(group.types[skillId]).info();
          /* eslint-disable camelcase */
          const { name, group_id } = skill;
          groupData[group_id] = name;
          this.skillList[group.types[skillId]] = { name, group: group_id };
          this.groupList[groupId] = { name: group.name };
          console.log(`ESI read skill ${name}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  async writeSkillsToDb() {
    Object.keys(this.skillList).map(async (skillId) => {
      try {
        const key = Store.datastore.key({ path: ['Skill', parseInt(skillId, 10)] });
        await Store.datastore.datastore.save({
          key,
          data: this.skillList[skillId],
        });
      } catch (err) {
        console.error(`Error Saving Skill ${err}`);
      }
    });
    Object.keys(this.groupList).map(async (groupId) => {
      try {
        const key = Store.datastore.key({ path: ['SkillGroup', parseInt(groupId, 10)] });
        await Store.datastore.datastore.save({
          key,
          data: this.groupList[groupId],
        });
      } catch (err) {
        console.error(`Error Saving Skill Group ${err}`);
      }
    });
  }

  async loadFromDb() {
    try {
      console.time('loadFromDb');
      let query = Store.datastore.createQuery('Skill');
      let entities = await Store.datastore.runQuery(query);
      const skillArray = entities[0];
      query = Store.datastore.createQuery('SkillGroup');
      entities = await Store.datastore.runQuery(query);
      const groupArray = entities[0];
      if (skillArray.length === 0 || groupArray.length === 0) {
        throw new Error('no skills found in db');
      }
      for (const sk in skillArray) {
        const { name, group } = skillArray[sk];
        this.skillList[sk] = { name, group };
      }
      for (const gp in groupArray) {
        this.groupList[gp] = groupArray[gp].name;
      }
      console.timeEnd('loadFromDb');
    } catch (err) {
      // Error.
      console.log('Skills static data not found in db');
      await this.loadSkillsfromEsi();
      await this.writeSkillsToDb();
    }
  }
}

const instance = new SkillStatic();

module.exports = instance;
