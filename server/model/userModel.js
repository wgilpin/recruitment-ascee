const User = require('../schema/userSchema');

class UserModel {
  static get(id) {
    // check datastore cache
    return User.get(id)
      .catch(() => {
        // not in cache
        console.error(`user ${id} not in cache`);
        return null;
      });
  }

  static async update({
    id, main, name, token, image,
  }) {
    let entityData = typeof image === 'undefined' ? { main, name, token } : { main, name, token, image };

    entityData = User.sanitize(entityData);
    console.log(`update data ${id} = ${token}`);
    try {
      const entity = await User.update(id, entityData);
      console.log(`alt ${id} updated successfully.`, entity.plain());
      return entity;
    } catch (err) {
      // entity not found
      try {
        const entity = await new User(entityData, id).save();
        console.log(`alt ${entity.entityKey} created successfully.`);
        return entity;
      } catch (error) {
        console.error('ERROR in update/save:', error);
        return null;
      }
    }
  }
}

module.exports = UserModel;
