import type { IronSessionOptions } from "iron-session";
import { env } from "../env/server.mjs";

export const sessionOptions: IronSessionOptions = {
  cookieName: "t3-for-web3-lerna-cookie",
  password: env.SECRET_COOKIE_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },

  ttl: 60 * 5,
};
