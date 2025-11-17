import { z } from "zod";

export const difficultyEnum = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof difficultyEnum>;

export const newSessionSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email." }),

  seed: z.string().trim().optional(),

  difficulty: difficultyEnum,

  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes must be at most 500 characters." })
    .optional(),
});

export type NewSessionFormValues = z.infer<typeof newSessionSchema>;
