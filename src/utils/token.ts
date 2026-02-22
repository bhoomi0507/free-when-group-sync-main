import { customAlphabet } from "nanoid";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const TOKEN_LENGTH = 8;
const OWNER_KEY_LENGTH = 24;

const shortTokenGenerator = customAlphabet(BASE62, TOKEN_LENGTH);
const ownerKeyGenerator = customAlphabet(BASE62, OWNER_KEY_LENGTH);

export const generatePlanToken = () => shortTokenGenerator();
export const generateOwnerKey = () => ownerKeyGenerator();
