'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const assets = [];
    const now = new Date();

    for (let i = 1; i <= 50; i++) {
      assets.push({
        name: `Root Asset ${i}`,
        folder: Math.random() > 0.3, // 70% chance of being a folder
        createdAt: now,
        updatedAt: now
      });
    }

    for (let i = 51; i <= 1000; i++) {

      assets.push({
        name: `Asset ${i}`,
        folder: Math.random() > 0.5, // 50% chance
        createdAt: now,
        updatedAt: now
      });
    }

    await queryInterface.bulkInsert('asset', assets, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('asset', null, {});
  }
};
