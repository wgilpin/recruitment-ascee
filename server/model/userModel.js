const User = require('../schema/userSchema');

class UserModel {
  static get(id) {
    return User.get(id)
      .catch(err => console.error(err));
  }

  static create(main, name, token, image) {
    const entityData = User.sanitize({
      main, name, token, image,
    });
    console.log('data', entityData);
    new User(entityData)
      .save()
      .then((entity) => {
        console.log(`alt ${entity.entityKey} created successfully.`);
      })
      .catch((err) => {
        console.error('ERROR in create :', err);
      });
  }

  static update({
    id, main, name, token, image,
  }) {
    const entityData = User.sanitize({
      main, name, token, image,
    });
    console.log(`update data ${id} = ${token}`);
    User.update(id, entityData)
      .then((entity) => {
        console.log(`alt ${id} updated successfully.`, entity.plain());
      })
      .catch(() => {
        // entity not found
        new User(entityData, id)
          .save()
          .then((entity) => {
            console.log(`alt ${entity.entityKey} created successfully.`);
          })
          .catch((err) => {
            console.error('ERROR in update/save:', err);
          });
      });
  }
}

module.exports = UserModel;
