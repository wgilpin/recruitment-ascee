const esi = require('eve-swagger');
const Character = require('../schema/characterSchema');


class characterModel {
  static get(id, withPortrait = false) {
    // check datastore cache

    return Character.get(id)
      .catch(async () => {
        // not in cache, try esi
        let charData = await characterModel.getInfo(id);
        if (withPortrait) {
          const portraitData = await characterModel.getPortrait(id);
          charData = { ...charData, ...portraitData };
        }
        const entityData = Character.sanitize(charData);
        const char = new Character(entityData, id);
        await char.save();
        return char;
      });
  }

  static getInfo(userId) {
    const char = esi.characters(userId);
    return char.info();
  }

  static getPortrait(userId) {
    const char = esi.characters(userId);
    return char.portrait();
  }
}

module.exports = characterModel;
