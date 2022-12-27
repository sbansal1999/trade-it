import { router } from "../trpc";
import { tradeRouter } from "./trades";
import { userRouter } from "./users";

export const appRouter = router({
  trades: tradeRouter,
  users: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
