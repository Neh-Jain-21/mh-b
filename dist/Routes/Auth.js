"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const uuid_apikey_1 = __importDefault(require("uuid-apikey"));
// CONTROLLERS
const Auth_Controller_1 = __importDefault(require("../Controllers/Auth.Controller"));
const router = (0, express_1.Router)();
const Auth = new Auth_Controller_1.default();
router.post("/login", Auth.logIn);
router.post("/signup", Auth.signUp);
router.get("/verify-email", Auth.verifyEmail);
router.post("/resend-verify-email", Auth.resendVerifyEmail);
router.post("/send-forgotpass-email", Auth.sendForgotPassEmail);
router.post("/verify-otp", Auth.verifyOtp);
router.post("/forgotpass", Auth.forgotPassword);
//editCoverImage
// todo : Delete previous cover image if present
router.post("/editcoverimg", upload("../Server/uploads/user/", "coverImg").single("coverImg"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield user.updateOne({ _id: req.body.id }, {
            $set: {
                "details.coverImg": req.file.originalname,
            },
        }, { upsert: true });
        res.send({
            msg: "Profile Updated",
            user: User,
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//showCoverImage
router.get("/showcoverpic/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield user.findOne({ _id: req.params.id }, { "details.coverImg": 1 });
        const path = `uploads/user/${User.details.coverImg}`;
        let type = "image/png, image/jpg, image/jpeg";
        let s = fs_1.default.createReadStream(path);
        s.on("open", function () {
            res.set("Content-Type", type);
            s.pipe(res);
        });
        s.on("error", function () {
            res.end();
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//editProfileImage
// todo : Delete previous profile image if present
router.post("/editprofileimg", upload("../Server/uploads/user/", "profileImg").single("profileImg"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield user.updateOne({ _id: req.body.id }, {
            $set: {
                "details.profileImg": req.file.originalname,
            },
        }, { upsert: true });
        res.send({
            msg: "Profile Updated",
            user: User,
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//showProfileImage
router.get("/showprofilepic/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield user.findOne({ _id: req.params.id }, { "details.profileImg": 1 });
        const path = `uploads/user/${User.details.profileImg}`;
        let type = "image/png, image/jpg, image/jpeg";
        let s = fs_1.default.createReadStream(path);
        s.on("open", function () {
            res.set("Content-Type", type);
            s.pipe(res);
        });
        s.on("error", function () {
            res.end();
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//sendSearchedUsers
router.post("/showUsers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const User = yield user
            .find({ username: { $regex: params.username, $options: "i" } }, {
            _id: 0,
            username: 1,
        })
            .limit(10);
        res.send({
            user: User,
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//showPublicProfile
router.post("/showPublicProfile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const User = yield user.findOne({ username: params.username }, {
            username: 1,
            details: 1,
            followers: 1,
            following: 1,
        });
        if (User) {
            res.send({
                msg: "Profile Updated",
                user: User,
            });
        }
        else {
            res.send({
                err: "User not Found",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
//editProfileDetails
router.post("/editProfileDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        yield user.updateOne({ _id: params.userid }, {
            $set: {
                "details.tagline": params.tagline,
                "details.bio": params.bio,
                "details.websiteLink": params.websitelink,
                "details.twitterLink": params.twitterlink,
                "details.facebookLink": params.facebooklink,
                "details.instagramLink": params.instagramlink,
            },
        }, { upsert: true });
        res.send({
            msg: "Profile Updated",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//show MyProfile
router.post("/showProfileDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const User = yield user.findOne({ _id: params.userid }, {
            username: 1,
            details: 1,
            followers: 1,
            following: 1,
        });
        res.send({
            msg: "Profile Updated",
            user: User,
        });
    }
    catch (error) {
        console.log(error);
    }
}));
//FirstVisit or not?
router.post("/firstVisit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const User = yield user.findById(params.id).select("first_visit");
        if (User.first_visit) {
            yield user.findOneAndUpdate({ _id: params.id }, { $unset: { first_visit: 1 } });
            res.send(User);
        }
        else {
            res.send({ first_visit: false });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
//getVideos
router.post("/Getvideos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let videos = [];
        const params = req.body;
        const User = yield user.findOne({ _id: params.userid });
        User.videos.map((video) => {
            // let pathToFile = path.join(__dirname, "../", video.video);
            let pathToSnapshot = path_1.default.join(__dirname, "../", video.video + "thumbnail.jpeg");
            // require("child_process").exec(
            //     "ffmpeg -i " +
            //         pathToFile +
            //         " -ss 00:00:02 -frames:v 1 " +
            //         pathToSnapshot,
            //     function () {
            //         console.log("Saved the thumb to:", pathToSnapshot);
            //     }
            // );
            let thumb = fs_1.default.readFileSync(pathToSnapshot).toString("base64");
            videos.push({
                thumb: thumb,
                path: video.video,
                title: video.title,
                caption: video.caption,
                isPrivate: video.isPrivate,
            });
        });
        res.send(videos);
    }
    catch (error) {
        console.log(error);
    }
}));
//upload Video
router.post("/Uploadvideo", upload("../Server/uploads/videos/", "uploadMedia").single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pathToFile = "uploads/videos/" + req.file.originalname;
        const pathToSnapshot = "uploads/videos/" + req.file.originalname + "thumbnail.jpeg";
        require("child_process").exec("ffmpeg -i " + pathToFile + " -ss 00:00:02 -frames:v 1 " + pathToSnapshot, function () {
            console.log("Saved the thumb to:", pathToSnapshot);
        });
        yield user.updateOne({ _id: req.body.userid }, {
            $push: {
                videos: {
                    video: pathToFile,
                    title: req.body.title,
                    caption: req.body.caption,
                    isPrivate: req.body.isPrivate,
                },
            },
        });
        res.send({
            msg: "Video Uploaded",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
// delete video
router.delete("/Deletevideo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        yield user.updateOne({ _id: params.userid }, {
            $pull: {
                videos: {
                    video: params.video,
                },
            },
        });
        fs_1.default.rmSync(params.video);
        fs_1.default.rmSync(params.video + "thumbnail.jpeg");
        res.send({
            msg: "Deleted",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
// edit Video
router.post("/Editvideo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const User = yield user.update({ _id: params.userid, "videos.video": params.video }, {
            $set: {
                "videos.$.title": params.title,
                "videos.$.caption": params.caption,
                "videos.$.isPrivate": params.isPrivate,
            },
        });
        res.send({
            msg: "Updated",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
// getImages
router.post("/Getimages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // todo : compression remaining
    try {
        let images = [];
        const params = req.body;
        const User = yield user.findOne({ _id: params.userid });
        User.images.map((image) => {
            let pathToFile = path_1.default.join(__dirname, "../", image.image);
            let pathToSnapshot = path_1.default.join(__dirname, "../", image.image + "lowquality.jpeg");
            // require("child_process").exec(
            //     "ffmpeg -i " +
            //         pathToFile +
            //         " -ss 00:00:02 -frames:v 1 " +
            //         pathToSnapshot,
            //     function () {
            //         console.log("Saved the thumb to:", pathToSnapshot);
            //     }
            // );
            let imagecomp = fs_1.default.readFileSync(pathToFile).toString("base64");
            images.push({
                image: imagecomp,
                path: image.image,
                title: image.title,
                caption: image.caption,
                isPrivate: image.isPrivate,
            });
        });
        res.send(images);
    }
    catch (error) {
        console.log(error);
    }
}));
// delete image
router.delete("/Deleteimage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        yield user.updateOne({ _id: params.userid }, {
            $pull: {
                images: {
                    image: params.image,
                },
            },
        });
        fs_1.default.rmSync(params.image);
        res.send({
            msg: "Deleted",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
// upload Image
router.post("/Uploadimage", upload("../Server/uploads/images/", "uploadMedia").single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pathToFile = "uploads/images/" + req.file.originalname;
        yield user.updateOne({ _id: req.body.userid }, {
            $push: {
                images: {
                    image: pathToFile,
                    title: req.body.title,
                    caption: req.body.caption,
                    isPrivate: req.body.isPrivate,
                },
            },
        });
        res.send({
            msg: "Image Uploaded",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
// edit Image
router.post("/Editimage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        yield user.updateOne({ _id: params.userid, "images.image": params.image }, {
            $set: {
                "images.$.title": params.title,
                "images.$.caption": params.caption,
                "images.$.isPrivate": params.isPrivate,
            },
        });
        res.send({
            msg: "Updated",
        });
    }
    catch (error) {
        console.log(error);
    }
}));
// common route to see image and video
// common image
router.get("/streamimage/:id", (req, res) => {
    const path = `uploads/images/${req.params.id}`;
    let type = "image/png, image/jpg, image/jpeg";
    let s = fs_1.default.createReadStream(path);
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
    const stat = fs_1.default.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs_1.default.createReadStream(path, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
    }
    else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs_1.default.createReadStream(path).pipe(res);
    }
});
// API
//App section
router.post("/registerApp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const id = uuid_apikey_1.default.create();
        let date = new Date().toLocaleDateString();
        let time = new Date().toLocaleTimeString();
        let finalDate = date + ", " + time;
        const appExists = yield user.findOne({
            _id: params.userid,
            "apps.appname": params.appname,
        });
        if (appExists) {
            res.send({
                err: "Try different name",
            });
        }
        else {
            yield user.updateOne({ _id: params.userid }, {
                $push: {
                    apps: {
                        appname: params.appname,
                        key: id.uuid,
                        date: finalDate,
                    },
                },
            });
            res.send({
                msg: "App Created",
                key: id.apiKey,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// get all apps
router.post("/getAllApps", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const appExists = yield user.findOne({
            _id: params.userid,
        });
        if (appExists) {
            res.send(appExists.apps);
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// get one app
router.post("/getApp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        let appExists = yield user.find({ "apps.appname": params.appname }, {
            _id: params.userid,
            apps: { $elemMatch: { appname: params.appname } },
        });
        appExists[0].apps[0].key = uuid_apikey_1.default.toAPIKey(appExists[0].apps[0].key);
        if (appExists) {
            res.send(appExists[0].apps[0]);
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// delete an app
router.delete("/deleteApp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const appExists = yield user.updateOne({
            _id: params.userid,
        }, {
            $pull: {
                apps: {
                    appname: params.appname,
                },
            },
        });
        if (appExists) {
            res.send({ msg: "App Deleted" });
        }
        else {
            res.send({ err: "Cannot delete App" });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// upload app Images
router.post("/app/image/:apikey", upload("../Server/uploads/images/", "uploadMedia").single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pathToFile = "uploads/images/" + req.file.originalname;
        if (!uuid_apikey_1.default.isAPIKey(req.params.apikey)) {
            fs_1.default.rmSync(pathToFile);
            res.status(200).send({
                msg: "Invalid API Key",
            });
            return;
        }
        let key = uuid_apikey_1.default.toUUID(req.params.apikey);
        const User = yield user.updateOne({ "apps.key": key }, {
            $push: {
                "apps.$.images": {
                    image: pathToFile,
                },
            },
        });
        if (User.nModified) {
            res.status(200).send({
                msg: "Image Uploaded",
                id: req.file.originalname,
            });
        }
        else {
            fs_1.default.rmSync(pathToFile);
            res.status(200).send({
                msg: "Project not Found",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// delete app image
router.delete("/app/image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        let key = uuid_apikey_1.default.toUUID(params.apikey);
        const User = yield user.updateOne({ "apps.key": key }, {
            $pull: {
                "apps.$.images": {
                    image: params.image,
                },
            },
        });
        if (User.nModified) {
            fs_1.default.rmSync(params.image);
            res.send({
                msg: "Image Deleted",
            });
        }
        else {
            res.send({
                err: "Invalid Key or alredy Deleted",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// upload app Videos
router.post("/app/video/:apikey", upload("../Server/uploads/videos/", "uploadMedia").single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pathToFile = "uploads/videos/" + req.file.originalname;
        let pathToSnapshot = "uploads/videos/" + req.file.originalname + "thumbnail.jpeg";
        if (!uuid_apikey_1.default.isAPIKey(req.params.apikey)) {
            fs_1.default.rmSync(pathToFile);
            res.status(200).send({
                msg: "Invalid API Key",
            });
            return;
        }
        let key = uuid_apikey_1.default.toUUID(req.params.apikey);
        const User = yield user.updateOne({ "apps.key": key }, {
            $push: {
                "apps.$.videos": {
                    video: pathToFile,
                },
            },
        });
        if (User.nModified) {
            require("child_process").exec("ffmpeg -i " + pathToFile + " -ss 00:00:02 -frames:v 1 " + pathToSnapshot, function () {
                console.log("Saved the thumb to:", pathToSnapshot);
            });
            res.send({
                msg: "Video Uploaded",
                id: req.file.originalname,
            });
        }
        else {
            fs_1.default.rmSync(pathToFile);
            res.status(200).send({
                msg: "Project not Found",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// get thumbnail of image
router.get("/streamThumbnail/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const path = `uploads/videos/${req.params.id}`;
    let type = "image/png, image/jpg, image/jpeg";
    let s = fs_1.default.createReadStream(path);
    s.on("open", function () {
        res.set("Content-Type", type);
        s.pipe(res);
    });
    s.on("error", function () {
        res.set("Content-Type", "text/plain");
        res.status(404).end("Not found");
    });
}));
// delete app video
router.delete("/app/video", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        let key = uuid_apikey_1.default.toUUID(params.apikey);
        const User = yield user.updateOne({ "apps.key": key }, {
            $pull: {
                "apps.$.videos": {
                    video: params.video,
                },
            },
        });
        if (User.nModified) {
            fs_1.default.rmSync(params.video);
            fs_1.default.rmSync(params.video + "thumbnail.jpeg");
            res.send({
                msg: "Video Deleted",
            });
        }
        else {
            res.send({
                err: "Invalid Key or alredy Deleted",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
// API Over
//followers following
router.post("/followUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.body;
        const UserFound = yield user.findOne({
            _id: params.userid,
            "following.username": params.username,
        });
        const CurrentUser = yield user.findOne({
            _id: params.userid,
        }, { username: 1 });
        if (UserFound) {
            res.send({
                msg: "Already Following",
            });
        }
        else {
            yield user.updateOne({ _id: params.userid }, {
                $push: {
                    following: {
                        username: params.username,
                    },
                },
            });
            yield user.updateOne({ username: params.username }, {
                $push: {
                    followers: {
                        username: CurrentUser.username,
                    },
                },
            });
            res.send({
                msg: "Following",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
exports.default = router;
