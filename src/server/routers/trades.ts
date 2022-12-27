import { publicProcedure, router } from "../trpc";
import { z } from "zod";

const tradeObject = z.object({
  quantity: z.number().min(1).max(100),
  ticker: z.string().nullable(),
  price: z.number(),
});

type tradeObject = z.infer<typeof tradeObject>;

const trades: tradeObject[] = [
  {
    quantity: 5,
    ticker: "aapl",
    price: 500,
  },
  {
    quantity: 6,
    ticker: "aapl",
    price: 450,
  },
  {
    quantity: 7,
    ticker: "aapl",
    price: 5012,
  },
  {
    quantity: 8,
    ticker: "aapl",
    price: 5123,
  },
];

export const tradeRouter = router({
  create: publicProcedure.input(tradeObject).mutation(({ input }) => {
    return {
      msg: `trade has been proccessed at price ${input.price}`,
      ticker: `for the stock name ${input.ticker}`,
    };
  }),
  show: publicProcedure.query(() => {
    return trades;
  }),
});

export type AppRouter = typeof tradeRouter;
