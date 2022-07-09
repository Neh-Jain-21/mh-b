"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CREDENTIAL = exports.STATUS_CODES = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const env = dotenv_1.default.config();
exports.STATUS_CODES = {
    // 1XX INFORMATIONAL
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,
    // 2XX SUCCESS
    SUCCESS: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IM_USED: 226,
    // 3XX REDIRECTION
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,
    // 4XX CLIENT ERROR
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    UNPROCESSABLE_ENTITY: 422,
    VALIDATION_ERROR: 422,
    NOT_VALID_DATA: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    UNORDERED_COLLECTION: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    // 5XX SERVER ERROR
    SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    BANDWIDTH_LIMIT_EXCEEDED: 509,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511
};
exports.DB_CREDENTIAL = {
    host: (_a = env.parsed) === null || _a === void 0 ? void 0 : _a.DB_HOST,
    database: (_b = env.parsed) === null || _b === void 0 ? void 0 : _b.DB_DATABASE,
    username: (_c = env.parsed) === null || _c === void 0 ? void 0 : _c.DB_USERNAME,
    password: (_d = env.parsed) === null || _d === void 0 ? void 0 : _d.DB_PASSWORD,
    dialect: (_e = env.parsed) === null || _e === void 0 ? void 0 : _e.DB_DIALECT,
    // dialectOptions: {
    //     ssl: {
    //         require             : true,
    //         rejectUnauthorized  : false,
    //     },
    // },
    logging: false
};
