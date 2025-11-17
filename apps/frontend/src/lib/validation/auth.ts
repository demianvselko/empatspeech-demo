import { z } from "zod";
import type { AppRole } from "@/types/auth";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  role: z.enum(["Teacher", "Student"] as [AppRole, AppRole]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
