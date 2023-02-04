import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(3).max(30),
  description: z.string().min(3).max(1000),
});
