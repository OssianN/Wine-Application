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
  year: z.string(),
  price: z.string(),
  comment: z.string().optional(),
  column: z.number(),
  shelf: z.number(),
  _id: z.string().optional(),
});

export const storageSizeSchema = z.object({
  shelves: z.string().min(1, { message: 'Must be at least 1' }),
  columns: z.string().min(1, { message: 'Must be at least 1' }),
});
