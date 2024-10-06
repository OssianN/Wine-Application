'use client';
import { login } from '@/lib/session';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubmitButton } from '../SubmitButton';
import { loginFormSchema } from '@/lib/schemas';

export const LoginForm = () => {
  const form = useForm<LoginFormType>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form action={login} className="flex flex-col gap-4 items-center">
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
        <SubmitButton buttonText="Log in" />
      </form>
    </Form>
  );
};

type LoginFormType = z.infer<typeof loginFormSchema>;
