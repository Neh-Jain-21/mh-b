import { Sequelize } from "sequelize";

const Database = () => {
	if (process.env.DB_DATABASE && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
		const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
			host: process.env.DB_HOST,
			dialect: "postgres",
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
		});

		sequelize
			.authenticate()
			.then(() => {
				console.log("Connected to database :)");
			})
			.catch((reason) => {
				console.log(reason);
				console.error("Unable to connect to the database :(");
			});
	}
};

export default Database;
