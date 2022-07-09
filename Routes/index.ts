import { Express } from "express";
import Auth from "./Auth";

const Routes = (app: Express) => {
	app.get("/", (req, res) => {
		res.render("MediaHost");
	});

	app.use("/auth", Auth);
};

export = Routes;
