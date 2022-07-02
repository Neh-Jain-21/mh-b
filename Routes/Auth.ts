import fs from "fs";
import path from "path";
import { Router } from "express";
import uuidAPIKey from "uuid-apikey";
// CONFIGS
import Mailer from "../Configs/Mailer";
import Multer from "../Configs/Multer";
// SCHEMAS
import user from "../Schemas/userSchema";
// CONTROLLERS
import AuthController from "../Controllers/Auth.Controller";

const router = Router();
const Auth = new AuthController();

router.post("/login", Auth.logIn);
router.post("/signup", Auth.signUp);
router.get("/verify-email", Auth.verifyEmail);
router.post("/resend-verify-email", Auth.resendVerifyEmail);
router.post("/send-forgotpass-email", Auth.sendForgotPassEmail);
router.post("/verify-otp", Auth.verifyOtp);
router.post("/forgotpass", Auth.forgotPassword);

//editCoverImage
// todo : Delete previous cover image if present
router.post("/editcoverimg", upload("../Server/uploads/user/", "coverImg").single("coverImg"), async (req, res) => {
	try {
		const User = await user.updateOne(
			{ _id: req.body.id },
			{
				$set: {
					"details.coverImg": req.file.originalname,
				},
			},
			{ upsert: true }
		);

		res.send({
			msg: "Profile Updated",
			user: User,
		});
	} catch (error) {
		console.log(error);
	}
});

//showCoverImage
router.get("/showcoverpic/:id", async (req, res) => {
	try {
		const User = await user.findOne({ _id: req.params.id }, { "details.coverImg": 1 });

		const path = `uploads/user/${User.details.coverImg}`;
		let type = "image/png, image/jpg, image/jpeg";

		let s = fs.createReadStream(path);

		s.on("open", function () {
			res.set("Content-Type", type);
			s.pipe(res);
		});
		s.on("error", function () {
			res.end();
		});
	} catch (error) {
		console.log(error);
	}
});

//editProfileImage
// todo : Delete previous profile image if present
router.post("/editprofileimg", upload("../Server/uploads/user/", "profileImg").single("profileImg"), async (req, res) => {
	try {
		const User = await user.updateOne(
			{ _id: req.body.id },
			{
				$set: {
					"details.profileImg": req.file.originalname,
				},
			},
			{ upsert: true }
		);

		res.send({
			msg: "Profile Updated",
			user: User,
		});
	} catch (error) {
		console.log(error);
	}
});

//showProfileImage
router.get("/showprofilepic/:id", async (req, res) => {
	try {
		const User = await user.findOne({ _id: req.params.id }, { "details.profileImg": 1 });

		const path = `uploads/user/${User.details.profileImg}`;
		let type = "image/png, image/jpg, image/jpeg";

		let s = fs.createReadStream(path);

		s.on("open", function () {
			res.set("Content-Type", type);
			s.pipe(res);
		});
		s.on("error", function () {
			res.end();
		});
	} catch (error) {
		console.log(error);
	}
});

//sendSearchedUsers
router.post("/showUsers", async (req, res) => {
	try {
		const params = req.body;

		const User = await user
			.find(
				{ username: { $regex: params.username, $options: "i" } },
				{
					_id: 0,
					username: 1,
				}
			)
			.limit(10);

		res.send({
			user: User,
		});
	} catch (error) {
		console.log(error);
	}
});

//showPublicProfile
router.post("/showPublicProfile", async (req, res) => {
	try {
		const params = req.body;

		const User = await user.findOne(
			{ username: params.username },
			{
				username: 1,
				details: 1,
				followers: 1,
				following: 1,
			}
		);

		if (User) {
			res.send({
				msg: "Profile Updated",
				user: User,
			});
		} else {
			res.send({
				err: "User not Found",
			});
		}
	} catch (error) {
		console.log(error);
	}
});

//editProfileDetails
router.post("/editProfileDetails", async (req, res) => {
	try {
		const params = req.body;

		await user.updateOne(
			{ _id: params.userid },
			{
				$set: {
					"details.tagline": params.tagline,
					"details.bio": params.bio,
					"details.websiteLink": params.websitelink,
					"details.twitterLink": params.twitterlink,
					"details.facebookLink": params.facebooklink,
					"details.instagramLink": params.instagramlink,
				},
			},
			{ upsert: true }
		);

		res.send({
			msg: "Profile Updated",
		});
	} catch (error) {
		console.log(error);
	}
});

//show MyProfile
router.post("/showProfileDetails", async (req, res) => {
	try {
		const params = req.body;

		const User = await user.findOne(
			{ _id: params.userid },
			{
				username: 1,
				details: 1,
				followers: 1,
				following: 1,
			}
		);

		res.send({
			msg: "Profile Updated",
			user: User,
		});
	} catch (error) {
		console.log(error);
	}
});

//FirstVisit or not?
router.post("/firstVisit", async (req, res) => {
	try {
		const params = req.body;

		const User = await user.findById(params.id).select("first_visit");

		if (User.first_visit) {
			await user.findOneAndUpdate({ _id: params.id }, { $unset: { first_visit: 1 } });
			res.send(User);
		} else {
			res.send({ first_visit: false });
		}
	} catch (error) {
		console.log(error);
	}
});

//getVideos
router.post("/Getvideos", async (req, res) => {
	try {
		let videos = [];

		const params = req.body;

		const User = await user.findOne({ _id: params.userid });

		User.videos.map((video) => {
			// let pathToFile = path.join(__dirname, "../", video.video);
			let pathToSnapshot = path.join(__dirname, "../", video.video + "thumbnail.jpeg");

			// require("child_process").exec(
			//     "ffmpeg -i " +
			//         pathToFile +
			//         " -ss 00:00:02 -frames:v 1 " +
			//         pathToSnapshot,
			//     function () {
			//         console.log("Saved the thumb to:", pathToSnapshot);
			//     }
			// );

			let thumb = fs.readFileSync(pathToSnapshot).toString("base64");

			videos.push({
				thumb: thumb,
				path: video.video,
				title: video.title,
				caption: video.caption,
				isPrivate: video.isPrivate,
			});
		});

		res.send(videos);
	} catch (error) {
		console.log(error);
	}
});

//upload Video
router.post("/Uploadvideo", upload("../Server/uploads/videos/", "uploadMedia").single("image"), async (req, res) => {
	try {
		const pathToFile = "uploads/videos/" + req.file.originalname;
		const pathToSnapshot = "uploads/videos/" + req.file.originalname + "thumbnail.jpeg";

		require("child_process").exec("ffmpeg -i " + pathToFile + " -ss 00:00:02 -frames:v 1 " + pathToSnapshot, function () {
			console.log("Saved the thumb to:", pathToSnapshot);
		});

		await user.updateOne(
			{ _id: req.body.userid },
			{
				$push: {
					videos: {
						video: pathToFile,
						title: req.body.title,
						caption: req.body.caption,
						isPrivate: req.body.isPrivate,
					},
				},
			}
		);

		res.send({
			msg: "Video Uploaded",
		});
	} catch (error) {
		console.log(error);
	}
});

// delete video
router.delete("/Deletevideo", async (req, res) => {
	try {
		const params = req.body;

		await user.updateOne(
			{ _id: params.userid },
			{
				$pull: {
					videos: {
						video: params.video,
					},
				},
			}
		);

		fs.rmSync(params.video);
		fs.rmSync(params.video + "thumbnail.jpeg");

		res.send({
			msg: "Deleted",
		});
	} catch (error) {
		console.log(error);
	}
});

// edit Video
router.post("/Editvideo", async (req, res) => {
	try {
		const params = req.body;

		const User = await user.update(
			{ _id: params.userid, "videos.video": params.video },
			{
				$set: {
					"videos.$.title": params.title,
					"videos.$.caption": params.caption,
					"videos.$.isPrivate": params.isPrivate,
				},
			}
		);

		res.send({
			msg: "Updated",
		});
	} catch (error) {
		console.log(error);
	}
});

// getImages
router.post("/Getimages", async (req, res) => {
	// todo : compression remaining
	try {
		let images = [];

		const params = req.body;

		const User = await user.findOne({ _id: params.userid });

		User.images.map((image) => {
			let pathToFile = path.join(__dirname, "../", image.image);
			let pathToSnapshot = path.join(__dirname, "../", image.image + "lowquality.jpeg");

			// require("child_process").exec(
			//     "ffmpeg -i " +
			//         pathToFile +
			//         " -ss 00:00:02 -frames:v 1 " +
			//         pathToSnapshot,
			//     function () {
			//         console.log("Saved the thumb to:", pathToSnapshot);
			//     }
			// );

			let imagecomp = fs.readFileSync(pathToFile).toString("base64");

			images.push({
				image: imagecomp,
				path: image.image,
				title: image.title,
				caption: image.caption,
				isPrivate: image.isPrivate,
			});
		});

		res.send(images);
	} catch (error) {
		console.log(error);
	}
});

// delete image
router.delete("/Deleteimage", async (req, res) => {
	try {
		const params = req.body;

		await user.updateOne(
			{ _id: params.userid },
			{
				$pull: {
					images: {
						image: params.image,
					},
				},
			}
		);

		fs.rmSync(params.image);

		res.send({
			msg: "Deleted",
		});
	} catch (error) {
		console.log(error);
	}
});

// upload Image
router.post("/Uploadimage", upload("../Server/uploads/images/", "uploadMedia").single("image"), async (req, res) => {
	try {
		let pathToFile = "uploads/images/" + req.file.originalname;

		await user.updateOne(
			{ _id: req.body.userid },
			{
				$push: {
					images: {
						image: pathToFile,
						title: req.body.title,
						caption: req.body.caption,
						isPrivate: req.body.isPrivate,
					},
				},
			}
		);

		res.send({
			msg: "Image Uploaded",
		});
	} catch (error) {
		console.log(error);
	}
});

// edit Image
router.post("/Editimage", async (req, res) => {
	try {
		const params = req.body;

		await user.updateOne(
			{ _id: params.userid, "images.image": params.image },
			{
				$set: {
					"images.$.title": params.title,
					"images.$.caption": params.caption,
					"images.$.isPrivate": params.isPrivate,
				},
			}
		);

		res.send({
			msg: "Updated",
		});
	} catch (error) {
		console.log(error);
	}
});

// common route to see image and video

// common image
router.get("/streamimage/:id", (req, res) => {
	const path = `uploads/images/${req.params.id}`;
	let type = "image/png, image/jpg, image/jpeg";

	let s = fs.createReadStream(path);

	s.on("open", function () {
		res.set("Content-Type", type);
		s.pipe(res);
	});
	s.on("error", function () {
		res.set("Content-Type", "text/plain");
		res.status(404).end("Not found");
	});
});

// common video
router.get("/streamvideo/:id", (req, res) => {
	const path = `uploads/videos/${req.params.id}`;
	const stat = fs.statSync(path);
	const fileSize = stat.size;
	const range = req.headers.range;
	if (range) {
		const parts = range.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
		const chunksize = end - start + 1;
		const file = fs.createReadStream(path, { start, end });
		const head = {
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4",
		};
		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			"Content-Length": fileSize,
			"Content-Type": "video/mp4",
		};
		res.writeHead(200, head);
		fs.createReadStream(path).pipe(res);
	}
});

// API

//App section
router.post("/registerApp", async (req, res) => {
	try {
		const params = req.body;

		const id = uuidAPIKey.create();

		let date = new Date().toLocaleDateString();
		let time = new Date().toLocaleTimeString();
		let finalDate = date + ", " + time;

		const appExists = await user.findOne({
			_id: params.userid,
			"apps.appname": params.appname,
		});

		if (appExists) {
			res.send({
				err: "Try different name",
			});
		} else {
			await user.updateOne(
				{ _id: params.userid },
				{
					$push: {
						apps: {
							appname: params.appname,
							key: id.uuid,
							date: finalDate,
						},
					},
				}
			);

			res.send({
				msg: "App Created",
				key: id.apiKey,
			});
		}
	} catch (error) {
		console.log(error);
	}
});

// get all apps
router.post("/getAllApps", async (req, res) => {
	try {
		const params = req.body;

		const appExists = await user.findOne({
			_id: params.userid,
		});

		if (appExists) {
			res.send(appExists.apps);
		}
	} catch (error) {
		console.log(error);
	}
});

// get one app
router.post("/getApp", async (req, res) => {
	try {
		const params = req.body;

		let appExists = await user.find(
			{ "apps.appname": params.appname },
			{
				_id: params.userid,
				apps: { $elemMatch: { appname: params.appname } },
			}
		);

		appExists[0].apps[0].key = uuidAPIKey.toAPIKey(appExists[0].apps[0].key);

		if (appExists) {
			res.send(appExists[0].apps[0]);
		}
	} catch (error) {
		console.log(error);
	}
});

// delete an app
router.delete("/deleteApp", async (req, res) => {
	try {
		const params = req.body;

		const appExists = await user.updateOne(
			{
				_id: params.userid,
			},
			{
				$pull: {
					apps: {
						appname: params.appname,
					},
				},
			}
		);

		if (appExists) {
			res.send({ msg: "App Deleted" });
		} else {
			res.send({ err: "Cannot delete App" });
		}
	} catch (error) {
		console.log(error);
	}
});

// upload app Images
router.post("/app/image/:apikey", upload("../Server/uploads/images/", "uploadMedia").single("image"), async (req, res) => {
	try {
		let pathToFile = "uploads/images/" + req.file.originalname;
		if (!uuidAPIKey.isAPIKey(req.params.apikey)) {
			fs.rmSync(pathToFile);
			res.status(200).send({
				msg: "Invalid API Key",
			});
			return;
		}

		let key = uuidAPIKey.toUUID(req.params.apikey);

		const User = await user.updateOne(
			{ "apps.key": key },
			{
				$push: {
					"apps.$.images": {
						image: pathToFile,
					},
				},
			}
		);

		if (User.nModified) {
			res.status(200).send({
				msg: "Image Uploaded",
				id: req.file.originalname,
			});
		} else {
			fs.rmSync(pathToFile);
			res.status(200).send({
				msg: "Project not Found",
			});
		}
	} catch (error) {
		console.log(error);
	}
});

// delete app image
router.delete("/app/image", async (req, res) => {
	try {
		const params = req.body;
		let key = uuidAPIKey.toUUID(params.apikey);

		const User = await user.updateOne(
			{ "apps.key": key },
			{
				$pull: {
					"apps.$.images": {
						image: params.image,
					},
				},
			}
		);

		if (User.nModified) {
			fs.rmSync(params.image);
			res.send({
				msg: "Image Deleted",
			});
		} else {
			res.send({
				err: "Invalid Key or alredy Deleted",
			});
		}
	} catch (error) {
		console.log(error);
	}
});

// upload app Videos
router.post("/app/video/:apikey", upload("../Server/uploads/videos/", "uploadMedia").single("video"), async (req, res) => {
	try {
		let pathToFile = "uploads/videos/" + req.file.originalname;
		let pathToSnapshot = "uploads/videos/" + req.file.originalname + "thumbnail.jpeg";
		if (!uuidAPIKey.isAPIKey(req.params.apikey)) {
			fs.rmSync(pathToFile);
			res.status(200).send({
				msg: "Invalid API Key",
			});
			return;
		}

		let key = uuidAPIKey.toUUID(req.params.apikey);

		const User = await user.updateOne(
			{ "apps.key": key },
			{
				$push: {
					"apps.$.videos": {
						video: pathToFile,
					},
				},
			}
		);

		if (User.nModified) {
			require("child_process").exec("ffmpeg -i " + pathToFile + " -ss 00:00:02 -frames:v 1 " + pathToSnapshot, function () {
				console.log("Saved the thumb to:", pathToSnapshot);
			});

			res.send({
				msg: "Video Uploaded",
				id: req.file.originalname,
			});
		} else {
			fs.rmSync(pathToFile);
			res.status(200).send({
				msg: "Project not Found",
			});
		}
	} catch (error) {
		console.log(error);
	}
});

// get thumbnail of image
router.get("/streamThumbnail/:id", async (req, res) => {
	const path = `uploads/videos/${req.params.id}`;
	let type = "image/png, image/jpg, image/jpeg";

	let s = fs.createReadStream(path);

	s.on("open", function () {
		res.set("Content-Type", type);
		s.pipe(res);
	});
	s.on("error", function () {
		res.set("Content-Type", "text/plain");
		res.status(404).end("Not found");
	});
});

// delete app video
router.delete("/app/video", async (req, res) => {
	try {
		const params = req.body;
		let key = uuidAPIKey.toUUID(params.apikey);

		const User = await user.updateOne(
			{ "apps.key": key },
			{
				$pull: {
					"apps.$.videos": {
						video: params.video,
					},
				},
			}
		);

		if (User.nModified) {
			fs.rmSync(params.video);
			fs.rmSync(params.video + "thumbnail.jpeg");
			res.send({
				msg: "Video Deleted",
			});
		} else {
			res.send({
				err: "Invalid Key or alredy Deleted",
			});
		}
	} catch (error) {
		console.log(error);
	}
});

// API Over

//followers following
router.post("/followUser", async (req, res) => {
	try {
		const params = req.body;

		const UserFound = await user.findOne({
			_id: params.userid,
			"following.username": params.username,
		});

		const CurrentUser = await user.findOne(
			{
				_id: params.userid,
			},
			{ username: 1 }
		);

		if (UserFound) {
			res.send({
				msg: "Already Following",
			});
		} else {
			await user.updateOne(
				{ _id: params.userid },
				{
					$push: {
						following: {
							username: params.username,
						},
					},
				}
			);

			await user.updateOne(
				{ username: params.username },
				{
					$push: {
						followers: {
							username: CurrentUser.username,
						},
					},
				}
			);

			res.send({
				msg: "Following",
			});
		}
	} catch (error) {
		console.log(error);
	}
});

export default router;
