import { Express } from "express";

const Routes = (app: Express) => {
	app.get("/", (req, res) => {
		console.log("HERE 111111111111");

		res.handler.success();
	});

	// app.use("/auth", require("./Auth"));
};

export default Routes;
