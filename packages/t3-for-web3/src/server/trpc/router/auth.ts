import { generateNonce, SiweMessage } from "siwe";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { siweMessageSchema } from "../../../utils/validator/siwe";
import { TRPCError } from "@trpc/server";
import { holderValidation, racksProjectManager } from "@smart-contracts";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  /**
   * Nonce
   */
  nonce: publicProcedure.query(async ({ ctx }) => {
    // Get current date to setup session expiration
    const currentDate = new Date();

    // Setup Session
    ctx.session.nonce = generateNonce();
    ctx.session.issuedAt = currentDate.toISOString();
    ctx.session.expirationTime = new Date(
      currentDate.getTime() + 10 * 60 * 1000 // 10 minutes from the current time
    ).toISOString();

    // Save Session
    await ctx.session.save();

    // Return
    return {
      nonce: ctx.session.nonce,
      issuedAt: ctx.session.issuedAt,
      expirationTime: ctx.session.expirationTime,
    };
  }),
  /**
   * Verify
   */
  verify: publicProcedure
    .input(
      //z.object({ message: z.object<SiweMessage>({}), signature: z.string() })
      z.object({
        message: siweMessageSchema,
        signature: z.string(),
      })
    )
    .output(z.object({ ok: z.boolean(), error: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const siweMessage = new SiweMessage(input.message as SiweMessage);

        // Verify signature if not valid throw an error
        console.log({ siweMessage });
        const fields = await siweMessage.verify({
          signature: input.signature,
          nonce: ctx.session.nonce,
        });

        // Verify is holder
        const isHolder = await racksProjectManager.isHolder(
          fields.data.address
        );

        if (!isHolder) {
          console.log("Not a holder", fields.data.address);
          return { ok: false, error: "Not a holder" };
        }

        let user = await ctx.prisma.user.findUnique({
          where: { address: fields.data.address },
        });

        if (!user) {
          user = await ctx.prisma.user.create({
            data: {
              address: fields.data.address,
              name: fields.data.address,
            },
          });
        }

        ctx.session.siwe = fields.data;
        ctx.session.user = {
          address: siweMessage.address,
          name: user.name,
          registered: user.registered,
        };

        console.log(ctx.session);
        await ctx.session.save();

        return { ok: true };
      } catch {
        throw new TRPCError({
          message: "Invalid signature",
          code: "BAD_REQUEST",
        });
      }
    }),
  /**
   * Logout
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy();
    return { ok: true };
  }),
});
