import z from "zod";

const loginSchema = z
  .object({
    email: z.email().trim().nonempty(),
    password: z.string().trim().nonempty(),
  })
  .strict();

type LoginInput = z.infer<typeof loginSchema>;

export { loginSchema, type LoginInput };
