import User from "./user.model.js";
import UserSurvey from "./survey.user.model.js";
import Survey from "../survey/survey.model.js";
import { SKIN, SURVEY } from "../utils/enum.collection.js";

const SKIN_TYPE_SECTION = "Oil Production";

export async function newUser(input) {
	const user = new User(input);

	return await user.save();
}

export async function updateUser(input, userID) {
	console.log(input);
	const updates = Object.keys(input);
	const updatesAllowed = [
		"name",
		"email",
		"password",
		"birthDate",
		"skinType",
		"concern",
	];
	const isValidOperation = updates.every((update) =>
		updatesAllowed.includes(update)
	);

	if (!isValidOperation) {
		throw new Error("Invalid update!");
	}

	const user = await User.findOne({ _id: userID });
	if (!user) {
		return undefined;
	}

	updates.forEach((element) => (user[element] = input[element]));
	return await user.save();
}

export async function verify(email, password, cb) {
	try {
		const user = await User.findByCredential(email, password);

		if (user) {
			if (!user.firstLogin)
				await User.findByIdAndUpdate(user._id, {
					firstLogin: new Date(),
				});
			cb(null, user);
		} else {
			cb(null, false, {
				message: "Incorrect username or password.",
			});
		}
	} catch (error) {
		cb(error);
	}
}

function createNewAnswerArray(userSurvey) {
	/* Creating new arry with section index */
	const answers = userSurvey.reduce((newArr, section) => {
		/* Iterating the question array */
		newArr[section.text.toUpperCase()] = section.question.reduce(
			(newArrQue, question) => {
				/* Iterating the question answers array to create an array with answer index */
				question.answer.reduce((newArrAns, answer) => {
					// Suming qt of answers per answer value
					newArrAns[answer.value] = newArrAns[answer.value] + 1 || 1;
					return newArrAns;
				}, newArrQue);
				return newArrQue;
			},
			{}
		);
		return newArr;
	}, []);

	return answers;
}

export async function saveUserSurvey(input, user) {
	const config = {
		section: {
			key: "_id",
			nextLevel: "question",
			update: { text: "section" },
		},
		question: {
			key: "_id",
			nextLevel: "answer",
			update: { text: "text" },
		},
		answer: {
			key: "_id",
			update: { text: "text", value: "value", analyses: "analyses" },
		},
	};
	const survey = await Survey.find({});
	const map = new Map();
	const createMap = (list, nodeName) => {
		list.forEach((document) => {
			map.set(document[config[nodeName].key].toString(), document);
			const nextNode = config[nodeName].nextLevel;
			if (nextNode) createMap(document[nextNode], nextNode);
		});
	};
	createMap(survey, "section");
	const completeUserSurvey = (nodeOjb, nodeName) => {
		const newInput = nodeOjb.map((element) => {
			const id = element[config[nodeName].key];
			const surveyObj = map.get(id);
			if (!surveyObj) throw new Error("Invalid input.");
			for (const [key, value] of Object.entries(
				config[nodeName].update
			)) {
				element[key] = surveyObj[value];
			}

			if (config[nodeName].nextLevel)
				element[config[nodeName].nextLevel] = completeUserSurvey(
					element[config[nodeName].nextLevel],
					config[nodeName].nextLevel
				);
			return element;
		});

		return newInput;
	};

	const filledDocument = completeUserSurvey(input.section, "section");
	await new UserSurvey({
		user,
		section: filledDocument,
	}).save();

	return filledDocument;
}

function summarySection(answers, section, ANSWER_ENUM, valuesAcc) {
	/* Order answer per section array by most answered value */
	if (!answers[section.toUpperCase()]) return {};
	const answerOrdened = Object.entries(answers[section.toUpperCase()]).sort(
		(ans1, ans2) => {
			return ans2[1] - ans1[1];
		}
	);
	/* Exchange array index per its value */
	let ANSWER_VALUE = [];
	for (const [key, value] of Object.entries(ANSWER_ENUM)) {
		if (valuesAcc && !valuesAcc.has(value)) continue;
		ANSWER_VALUE[value] = key;
	}

	const summaryAnswers = (summary, currAnswer) => {
		const currAnswerKey = currAnswer[0];
		const currAnswerSum = currAnswer[1];

		/* Validating if answer value is set on config ANSWER_ENUM */
		if (!ANSWER_VALUE[currAnswerKey]) return summary;
		summary.qtValid += currAnswerSum;
		const ansMeaning = ANSWER_VALUE[currAnswerKey].toLowerCase();

		if (summary.moreAnswered.length == 0) {
			summary.moreAnswered.push(ansMeaning);
			summary.maxAnsSum = currAnswerSum;
		} else if (currAnswerSum == summary.maxAnsSum) {
			summary.moreAnswered.push(ansMeaning);
		}
		return summary;
	};

	return answerOrdened.reduce(summaryAnswers, {
		qtValid: 0,
		moreAnswered: [],
		maxAnsSum: 0,
	});
}

async function analiseSkin(userSurvey) {
	let userUpdate = {};
	const fnSummary = (() => {
		const answers = createNewAnswerArray(userSurvey);

		return summarySection.bind(this, answers);
	})();

	const defineSkinType = () => {
		const skinAnalysis = fnSummary(
			SKIN_TYPE_SECTION.toUpperCase(),
			SURVEY.SKIN_ANSWER
		);
		if (skinAnalysis.qtValid >= SURVEY.ANALYSIS.MIN_ANSWER) {
			userUpdate.skinType =
				skinAnalysis.moreAnswered.length &&
				skinAnalysis.moreAnswered.length == 1
					? SKIN.TYPE[skinAnalysis.moreAnswered[0].toUpperCase()]
					: SKIN.TYPE.COMBINATION;
		}
	};
	defineSkinType();

	const setConcern = (concern) => {
		const { ANSWER_KEY, ANSWER_WEIGTH } = SURVEY.CONCERN;
		const skinAnalysis = fnSummary(
			concern,
			ANSWER_KEY[concern.toUpperCase()],
			new Set(ANSWER_WEIGTH[concern.toUpperCase()])
		);
		if (skinAnalysis.qtValid >= SURVEY.ANALYSIS.MIN_ANSWER) {
			userUpdate.concern
				? userUpdate.concern.push(concern)
				: (userUpdate.concern = [concern]);
		}
	};
	Object.values(SURVEY.CONCERN.SECTION).forEach(setConcern);

	return userUpdate;
}

export async function newUserSurvey(input, user) {
	let response = {};

	try {
		let result = false;
		const userSurvey = await saveUserSurvey(input, user);

		const updatedUser = await analiseSkin(userSurvey);
		console.log(updatedUser);
		await updateUser(updatedUser, user);

		if (updatedUser.skinType) {
			result = true;
			response.skinAnalysis = {
				result: updatedUser.skinType,
				analysis: SKIN_TYPE_SECTION,
				text: "Lorem ipsum dolor sit amet consectetur. Mauris vestibulum eleifend ut elit est eget venenatis vitae. Et cras dignissim enim facilisis sociis. Suspendisse congue congue eu duis mauris convallis elementum. Nulla amet quam a ullamcorper lacus lacus cras viverra sed.",
			};
		}
		response.concernAnalysis = [];
		if (updatedUser.concern && updatedUser.concern.length) {
			const section_concern = SURVEY.CONCERN.SECTION;
			let concern_section = [];
			for (const section in section_concern) {
				const concern = section_concern[section];
				concern_section[concern] = section;
			}

			result = true;

			response.concernAnalysis = updatedUser.concern.map((concern) => {
				return {
					result: concern,
					analysis: concern_section[concern],
					text: "Lorem ipsum dolor sit amet consectetur. Mauris vestibulum eleifend ut elit est eget venenatis vitae. Et cras dignissim enim facilisis sociis. Suspendisse congue congue eu duis mauris convallis elementum. Nulla amet quam a ullamcorper lacus lacus cras viverra sed.",
				};
			});
		}

		if (!result) {
			response.message =
				response.message +
				" Unfortunaly we do not have enough data to analise your skin type and concerns. When you are ready you can answer again the questionnaire.";
		}
	} catch (error) {
		throw new Error(error.message);
	} finally {
		const deleteResult = await UserSurvey.deleteOne({ user: user }); //just for testing
		console.log(deleteResult);
	}
	return response;
}
