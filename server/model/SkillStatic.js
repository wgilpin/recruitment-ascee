const esi = require('eve-swagger');
const Store = require('./Store');


class SkillStatic {
  constructor() {
    this.skillList = {};
    this.empty = true;
    // skill_id: { name, group_id }
    this.groupList = {};
    // groupId: { name }
  }

  async loadSkillsfromEsi() {
    const category = await esi.types.categories(16).info();
    /* eslint-disable guard-for-in  */
    /* eslint-disable  no-restricted-syntax */
    /* eslint-disable  no-await-in-loop */
    for (const gpIdx in category.groups) {
      const group = await esi.types.groups(category.groups[gpIdx]).info();
      const groupData = {};
      const errors = [];
      for (const skIdx in group.types) {
        try {
          const skill = await esi.types(group.types[skIdx]).info();
          /* eslint-disable camelcase */
          const { name, group_id, type_id } = skill;
          groupData[group_id] = name;
          this.skillList[type_id] = { name, group: group_id };
          this.empty = false;
          this.groupList[group_id] = { name: group.name };
          console.log(`ESI read skill ${type_id}: ${name}`);
        } catch (err) {
          console.error(err);
          errors.push(skIdx);
        }
      }
    }
  }

  async writeSkillsToDb() {
    Object.keys(this.skillList).map(async (skillId) => {
      try {
        const key = Store.datastore.key({ path: ['Skill', `${skillId}`] });
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
        const key = Store.datastore.key({ path: ['SkillGroup', `${groupId}`] });
        await Store.datastore.datastore.save({
          key,
          data: this.groupList[groupId],
        });
      } catch (err) {
        console.error(`Error Saving Skill Group ${err}`);
      }
    });
    console.log('skills written to db');
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
      for (const skIdx in skillArray) {
        const { name, group } = skillArray[skIdx];
        const skillId = skillArray[skIdx][Store.datastore.KEY].name;
        this.skillList[skillId] = { name, group };
      }
      for (const gpIdx in groupArray) {
        const groupId = groupArray[gpIdx][Store.datastore.KEY].name;
        this.groupList[groupId] = groupArray[gpIdx].name;
      }
      this.empty = false;
      console.timeEnd('loadFromDb');
    } catch (err) {
      // Error.
      console.log('Skills static data not found in db');
      await this.loadSkillsfromEsi();
      await this.writeSkillsToDb();
    }
  }

  async get(skillId) {
    if (this.empty) {
      await this.loadFromDb();
    }
    return skillId ? this.skillList[skillId] : true;
  }
}

const instance = new SkillStatic();

module.exports = instance;
