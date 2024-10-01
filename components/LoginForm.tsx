'use client';
import { login } from '@/lib/session';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const LoginForm = () => {
  const form = useForm<LoginFormType>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form action={login}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input {...field} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input {...field} className="resize-none" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Search</Button>
      </form>
    </Form>
  );
};

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string(),
});
type LoginFormType = z.infer<typeof loginFormSchema>;

// const passwordForm = z
//   .object({
//     password: z.string(),
//     confirm: z.string(),
//   })
//   .refine(data => data.password === data.confirm, {
//     message: "Passwords don't match",
//     path: ['confirm'], // path of error
//   });

// passwordForm.parse({ password: 'asdf', confirm: 'qwer' });
