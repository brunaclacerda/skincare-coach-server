import mongoose from "mongoose";
import validator from "validator";

import { differenceInYears } from "date-fns";
import { USER, SKIN_TYPE, SKIN_CONCERN } from "../utils/enum.collection.js";
import { USER_STATUS } from "../utils/enum.js";

import Schema from "../db/Schema.js";

const DATE_FORMAT = "dd/MM/yyyy";
const SALT = "f844b09ff50c";

let crypto;
try {
	crypto = await import("node:crypto");
} catch (err) {
	console.error("crypto support is disabled!", err);
}

const userSchema = new Schema(
	{
		name: {
			first: {
				type: String,
				minlength: [4, "First naame should have at least 4 letters."],
				trim: true,
			},
			last: {
				type: String,
				minlength: [4, "Last name should have at least 4 letters."],
				trim: true,
			},
		},
		email: {
			type: String,
			required: "E-mail is required.",
			trim: true,
			unique: true,
			lowercase: true,
			validate(email) {
				if (!validator.isEmail(email)) {
					throw new Error("E-mail invalid! ");
				}
			},
		},

		password: {
			type: "Buffer",
			required: "Password is required.",
			minlength: [5, "Password is shorter than 5 characters."],
			// for testing
			// minlength: [10, "Password is shorter than 10 characters."],
			// validate(value) {
			// 	if (!validator.isStrongPassword(value.toString())) {
			// 		throw new Error(
			// 			"Password is not strong enough. It should cointain at least: " +
			// 				"1 letter lowercase, 1 letter uppercase, 1 number and 1 special character!"
			// 		);
			// 	}
			// },
		},

		status: {
			type: String,
			default: USER_STATUS.active,
		},

		birthDate: {
			type: Date,
			validate(date) {
				if (
					!validator.isDate(date, {
						format: DATE_FORMAT,
						delimiters: "/",
					})
				) {
					throw new Error("Birth date informed is invalid.");
				}
				const newDate = new Date();

				if (differenceInYears(newDate, date) < 18) {
					throw new Error("User must be at least 18-year-old.");
				}
			},
		},
		skinType: {
			type: String,
			enum: SKIN_TYPE,
		},
		concern: [
			{
				type: String,
				enum: SKIN_CONCERN,
				required: true,
			},
		],
		gender: {
			type: String,
			enum: USER.GENDER,
		},
		firstLogin: Date,
	},
	{
		virtuals: {
			fullName: {
				get() {
					return this.name.first + " " + this.name.last;
				},
			},
			age: {
				get() {
					return differenceInYears(new Date(), this.birthDate);
				},
			},
		},
		timestamps: true,
	}
);

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;

	return userObject;
};

userSchema.statics.findByCredential = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) return;
	const hash = crypto.pbkdf2Sync(password, SALT, 310000, 32, `sha256`);

	if (!crypto.timingSafeEqual(user.password, hash)) {
		throw new Error("Incorrect username or password.");
	}
	return user;
};

userSchema.statics.findActiveUsers = async (criteria) => {
	let filter = { status: USER_STATUS.active };
	if (criteria.skinType) filter.skinType = criteria.skinType;
	if (criteria.concern?.length) filter.concern = criteria.concern;
	const users = await User.find(filter);
	return users;
};

userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = crypto.pbkdf2Sync(
			this.password,
			SALT,
			310000,
			32,
			`sha256`
		);
	}

	next();
});

//Error handler middleware
userSchema.post("save", function (error, doc, next) {
	console.log("error 1");
	if (error.name === "MongoServerError" && error.code === 11000) {
		console.log(error);
		return next(
			Object.keys(error.keyValue)[0] + ": There was a duplicate key error"
		);
	}
	if (error.name == "ValidationError") {
		const arMessages = Object.keys(error.errors).map(
			(key) => error.errors[key].message
		);
		return next(new Error(arMessages.join(" ")));
	}

	next(error);
});

const User = mongoose.model("User", userSchema);

export default User;

(async function () {
	try {
		await User.ensureIndexes();
	} catch (error) {
		console.log(error);
	}
})();
