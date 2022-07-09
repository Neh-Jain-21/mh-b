import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

type fileType = "coverImg" | "profileImg" | "uploadMedia";

const Multer = (storagePath: string, type: fileType) => {
	const storageCover = multer.diskStorage({
		destination: (req, file, callback) => {
			callback(null, storagePath);
		},
		filename: (req, file, callback) => {
			let fileName = "";
			if (type === "coverImg") {
				fileName = req.body.id + "_cover" + path.extname(file.originalname);
				callback(null, fileName);
				file.originalname = fileName;
			} else if (type === "profileImg") {
				fileName = req.body.id + "_profile" + path.extname(file.originalname);
				callback(null, fileName);
				file.originalname = fileName;
			} else if (type === "uploadMedia") {
				const id = uuidv4();

				fileName = id + path.extname(file.originalname);
				callback(null, fileName);
				file.originalname = fileName;
			} else {
				console.log("Invalid Type");
			}
		},
	});

	return multer({ storage: storageCover });
};

export = Multer;
