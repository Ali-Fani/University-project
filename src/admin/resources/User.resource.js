const {User} = require('../../models');

const UserResourceOptions = {
    databases: [],
    resource: User,
    options:{
      properties:{
        password:{isVisible: false}
      }
    }
  };

module.exports = UserResourceOptions
