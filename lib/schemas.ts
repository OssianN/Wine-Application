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
  year: z.coerce
    .number()
    .min(1800, { message: 'Must be after 1800' })
    .max(new Date().getFullYear(), {
      message: 'Must be this year at the latest',
    }),
  price: z.coerce.number().optional(),
  comment: z.string().optional(),
});

export const storageSizeSchema = z.object({
  shelves: z.coerce.number().min(1, { message: 'Must be at least 1' }),
  columns: z.coerce.number().min(1, { message: 'Must be at least 1' }),
});

export const positionSchema = z.object({
  shelf: z.coerce.number().min(0, { message: 'Must be at least 1' }),
  column: z.coerce.number().min(0, { message: 'Must be at least 1' }),
});
