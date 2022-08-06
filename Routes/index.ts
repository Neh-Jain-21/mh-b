import { Express } from "express";
//
import Auth from "./Auth";
import Images from "./Images";

/**
 * All api routes here
 */
const Routes = (app: Express) => {
	app.get("/", (req, res) => {
		res.render("MediaHost");
	});

	app.use("/auth", Auth);
	app.use("/images", Images);
};

export = Routes;
