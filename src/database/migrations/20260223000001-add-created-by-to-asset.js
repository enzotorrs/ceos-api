'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('asset', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'auth_user',
        key: 'id',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('asset', 'user_id');
  },
};
