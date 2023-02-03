import { racksProjectManager } from "@smart-contracts";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { registerMemberSchema } from "../../../utils/validator/registerMember";

import { router, protectedProcedure } from "../trpc";

export const profileRouter = router({
  register: protectedProcedure
    .input(registerMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const isMember = await racksProjectManager.isWalletMember(
        ctx.user.address
      );

      if (isMember) {
        ctx.user.registered = "pending";
        await ctx.session.save();
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not a member of the Racks Project.",
        });
      }

      await ctx.prisma.user.update({
        where: { address: ctx.user.address },
        data: {
          name: input.name,
          githubUsername: input.github,
          discordUsername: input.discord,
          avatar: input.avatar.image,
          registered: true,
        },
      });

      return { ok: true };
    }),
  changeName: protectedProcedure
    .input(z.object({ newName: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { address: ctx.user.address },
        data: { name: input.newName },
      });

      ctx.session.user = {
        name: input.newName,
        address: ctx.user.address,
        registered: ctx.user.registered,
      };

      await ctx.session.save();

      return { ok: true };
    }),
  changeAvatar: protectedProcedure
    .input(z.object({ newAvatar: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { address: ctx.user.address },
        data: { avatar: input.newAvatar },
      });

      ctx.session.user = {
        name: ctx.user.name,
        address: ctx.user.address,
        registered: ctx.user.registered,
        avatar: input.newAvatar,
      };

      await ctx.session.save();

      return { ok: true };
    }),
});
