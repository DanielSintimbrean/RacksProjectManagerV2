import { z } from "zod";

export const registerMemberSchema = z.object({
  name: z.string().min(3),
  github: z.string(),
  discord: z.string().refine((value) => {
    const regex = /^.{4,32}#\d{4}$/;
    return regex.test(value);
  }),
  email: z.string().email(),
  avatar: z.object({ id: z.number(), image: z.string().url() }),
});

export type RegisterMemberSchema = z.infer<typeof registerMemberSchema>;
