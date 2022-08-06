import { connect, set } from "mongoose";

if (process.env.DB_URI && process.env.DB_NAME) {
	const run = async () => {
		await connect(process.env.DB_URI || "mongodb://127.0.0.1:27017/mediahost", { dbName: process.env.DB_NAME });
	};

	run()
		.then(() => {
			console.log("Connected to database :)");

			set("toJSON", { virtuals: true });
		})
		.catch((reason) => {
			console.log(reason);
			console.error("Unable to connect to the database :(");
		});
}
