import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string(),
});

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

export const wineFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'At least one character' })
    .max(70, { message: 'Max 70 characters.' }),
  year: z
    .number()
    .min(1800, { message: 'Must be after 1800' })
    .max(new Date().getFullYear(), { message: 'Must this year at the latest' }),
  price: z.number().optional(),
  comment: z.string().optional(),
});

export const storageSizeSchema = z.object({
  shelves: z.preprocess(
    a => parseInt(z.string().parse(a), 10),
    z.number().positive().min(1, { message: 'Must be at least 1' })
  ),
  columns: z.preprocess(
    a => parseInt(z.string().parse(a), 10),
    z.number().positive().min(1, { message: 'Must be at least 1' })
  ),
});
