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
        orderId: z.string().length(16),
      })
    )
    .mutation(({ input }) => {
      const trade = prisma.trade.create({
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
          orderId: input.orderId,
        },
      });
      return trade;
    }),
});

export type AppRouter = typeof tradeRouter;
