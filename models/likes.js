'use strict';
module.exports = function(sequelize, DataTypes) {
  var likes = sequelize.define('likes', {
    messageId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {});

  likes.associate = function(models){
    likes.belongsTo(models.messages, {as: 'messages', foreignKey: 'messageId'});
    likes.belongsTo(models.users, {as: 'users', foreignKey: 'userId'})
  };

  return likes;
};
