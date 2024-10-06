import { z } from 'zod';

export const registerFormSchema = z
  .object({
    name: z.string().min(1, { message: 'Must be at least one character' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string(),
    confirm: z.string(),
  })
  .refine(data => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });
