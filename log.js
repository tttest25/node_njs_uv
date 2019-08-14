import * as pino from "pino";
// import { APP_ID, LOG_LEVEL } from "./Config";

export const logger = pino({
name: 'njs_uv',
level: 'debug'
});