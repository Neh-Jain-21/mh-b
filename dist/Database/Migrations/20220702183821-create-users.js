"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			username: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			email: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			password: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			name: {
				type: Sequelize.STRING,
			},
			tagline: {
				type: Sequelize.STRING,
			},
			bio: {
				type: Sequelize.STRING,
			},
			cover_img: {
				type: Sequelize.STRING,
			},
			profile_img: {
				type: Sequelize.STRING,
			},
			web_link: {
				type: Sequelize.STRING,
			},
			twitter_link: {
				type: Sequelize.STRING,
			},
			meta_link: {
				type: Sequelize.STRING,
			},
			instagram_link: {
				type: Sequelize.STRING,
			},
			otp: {
				type: Sequelize.STRING,
			},
			is_active: {
				type: Sequelize.BOOLEAN,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Users");
	},
};