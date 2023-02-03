import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { mrCryptoRouter } from "./mrcypto";
import { profileRouter } from "./profile";
import { projectRouter } from "./projects";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  mrCrypto: mrCryptoRouter,
  profile: profileRouter,
  project: projectRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
