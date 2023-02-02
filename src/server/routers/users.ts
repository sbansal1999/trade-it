import { PrismaClient } from "@prisma/client";
import { publicProcedure, router } from "../trpc";
const prisma = new PrismaClient();

import z from "zod";

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
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!user) throw new Error("User not found");

      return user;
    }),
});
