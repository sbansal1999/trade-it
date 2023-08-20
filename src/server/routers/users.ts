import { PrismaClient } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import z from "zod";

import { publicProcedure, router } from "../trpc";

const prisma = new PrismaClient();

export const userRouter = router({
  createUser: publicProcedure
    .input(
      z.object({
        password: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.string().datetime(),
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.create({
        data: {
          ...input,
        },
      });

      return user;
    }),

  getUserByID: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input,
        },
      });

      if (!user) {
        throw new TRPCClientError("User not found");
      }

      return user;
    }),
});

export type AppRouter = typeof userRouter;
