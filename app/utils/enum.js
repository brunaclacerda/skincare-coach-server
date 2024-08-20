export const USER_STATUS = Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
});

export const USER_GENDER = Object.freeze({
    MALE: "Male",
    FEMALE: "Female",
    TRANSFEMININE: "Transfeminine",
    TRANSMASCULINE: "Transmasculine",
    NONBINARY: "Nonbinary",
    OTHER: "Other",
});

/* SKIN ANALYSIS */

export const SKIN_ANALYSIS = Object.freeze({
    MIN_ANSWER: 2,
});

/* SKIN TYPE */
export const SKIN_TYPE = Object.freeze({
    OILY: "oily",
    DRY: "dry",
    NORMAL: "normal",
    COMBINATION: "combination",
});

export const SKIN_ANSWER_KEY = Object.freeze({
    OILY: "2",
    DRY: "5",
    NORMAL: "4",
    COMBINATION: "3",
});

/* SKIN CONCERNS */
export const SKIN_CONCERN = Object.freeze({
    ACNE: "acne",
    SENSITIVITY: "sensitivity",
    ELASTICITY: "elasticity",
    TONE: "tone",
});

/* ACNE */
export const ACNE_ANS_KEY = Object.freeze({
    PRONE: "5",
    SOME_PRONE: "4",
    NORMAL: "3",
    SOME_RESISTANT: "2",
    RESISTENT: "1",
});
export const CONCERN_ACNE_WEIGTH = [
    ACNE_ANS_KEY.PRONE,
    ACNE_ANS_KEY.SOME_PRONE,
];

/* SENSITIVITY */
export const SENSITIV_ANS_KEY = Object.freeze({
    VERY_SENSITIVE: "5",
    SENSITIVE: "4",
    NORMAL: "3",
    RESILIENT: "2",
    VERY_RESILIENT: "1",
});
export const CONCERN_SENSITIV_WEIGTH = [
    SENSITIV_ANS_KEY.VERY_SENSITIVE,
    SENSITIV_ANS_KEY.SENSITIVE,
];

/* ELASTICITY */
export const ELASTIC_ANS_KEY = Object.freeze({
    NOT_ELASTIC: "3",
    SOMEWHAT_ELASTIC: "2",
    ELASTIC: "1",
});
export const CONCERN_ELASTIC_WEIGTH = [ELASTIC_ANS_KEY.NOT_ELASTIC];

/* TONE */
export const TONE_ANS_KEY = Object.freeze({
    UNEVEN: "3",
    EVEN: "2",
});
export const CONCERN_TONE_WEIGTH = [TONE_ANS_KEY.UNEVEN];

export const SECTION_CONCERN = Object.freeze({
    Sensitivity: SKIN_CONCERN.SENSITIVITY,
    Elasticity: SKIN_CONCERN.ELASTICITY,
    Tone: SKIN_CONCERN.TONE,
    Acne: SKIN_CONCERN.ACNE,
});

export const SKIN_CONCERN_ANSWER = Object.freeze({
    ACNE: ACNE_ANS_KEY,
    SENSITIVITY: SENSITIV_ANS_KEY,
    ELASTICITY: ELASTIC_ANS_KEY,
    TONE: TONE_ANS_KEY,
});

export const SKIN_CONCERN_WEIGTH = Object.freeze({
    ACNE: CONCERN_ACNE_WEIGTH,
    SENSITIVITY: CONCERN_SENSITIV_WEIGTH,
    ELASTICITY: CONCERN_ELASTIC_WEIGTH,
    TONE: CONCERN_TONE_WEIGTH,
});

/* HTTP STATUS CODE */

export const HTTP_STATUS = Object.freeze({
    CREATED: 201,
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
});
