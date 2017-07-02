'use strict';
module.exports = function(sequelize, DataTypes) {
  var messages = sequelize.define('messages', {
    body: DataTypes.STRING
  }, {});

  messages.associate = function (models) {
    messages.belongsTo(models.users, {as: 'users', foreignKey: 'userId'});
  };

  return messages;
};
