import fs from "fs";
import { Schema, model, Types } from "mongoose";

interface IImages {
	image: string;
	title: string;
	caption: string;
	user_id: Types.ObjectId;
	isPrivate: boolean;
}

const ImagesSchema = new Schema<IImages>(
	{
		image: { type: Schema.Types.String, required: [true, "Image is required!"], unique: true },
		title: { type: Schema.Types.String },
		caption: { type: Schema.Types.String },
		user_id: { type: Schema.Types.ObjectId, required: [true, "User ID is required!"], ref: "Users" },
		isPrivate: { type: Schema.Types.Boolean, required: true, default: true },
	},
	{ timestamps: true }
);

ImagesSchema.virtual("imageData").get(function () {
	return fs.readFileSync(`./uploads/images/${this.image}`).toString("base64");
});

const Users = model<IImages>("Images", ImagesSchema);

export default Users;
