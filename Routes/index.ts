import { Express } from "express";

const Routes = (app: Express) => {
	app.get("/", (req, res) => {
		res.handler.success();
	});

	app.use("/auth", require("./Auth"));
};

export default Routes;
