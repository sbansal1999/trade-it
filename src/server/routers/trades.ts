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
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      //this is a workaround for a bug in prisma
      const balance = user.balance as unknown as number;
      const orderValue = input.quantity * input.price;

      if (input.action === "BUY") {
        if (balance < orderValue) {
          throw new Error("Insufficient funds");
        }
      }

      const newUser = await prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          balance:
            input.action === "BUY"
              ? balance - orderValue
              : balance + orderValue,
        },
      });

      const trade = await prisma.trade.create({
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
