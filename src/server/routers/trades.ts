import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const tradeRouter = router({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        symbol: z.string(),
        quantity: z.number(),
        price: z.number(),
        action: z.enum(["BUY", "SELL"]),
      })
    )
    .mutation(({ input }) => {
      const trade = prisma.trades.create({
        data: {
          user: {
            connect: {
              id: input.userId,
            },
          },
          symbol: input.symbol,
          quantity: input.quantity,
          price: input.price,
          action: input.action,
        },
      });
      return trade;
    }),
});

export type AppRouter = typeof tradeRouter;
