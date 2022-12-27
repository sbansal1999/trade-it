import { router } from "../trpc";
import { tradeRouter } from "./trades";

export const appRouter = router({
  trades: tradeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
