import z from "zod";

export const signupSchema = z.object({
	name:z.string().trim().nonempty(),
	email:z.email().trim().nonempty(),
	password:z.string().trim().nonempty(),
	role:z.enum(['customer','owner']).default('customer'),
	phone:z.string().optional()
})
.strict()

const loginSchema = z
  .object({
    email: z.email().trim().nonempty(),
    password: z.string().trim().nonempty(),
  })
  .strict();

type LoginInput = z.infer<typeof loginSchema>;

export { loginSchema, type LoginInput };
