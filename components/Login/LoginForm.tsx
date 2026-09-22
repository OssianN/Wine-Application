'use client';
import { login, type LoginActionState } from '@/lib/session';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubmitButton } from '../SubmitButton';
import { loginFormSchema } from '@/lib/schemas';
import { useActionState, useEffect } from 'react';

const initialState: LoginActionState = {};

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

  const serverAction = (prev: unknown, formData: FormData) =>
    login(prev, formData);
  const [formState, formAction] = useActionState(serverAction, initialState);

  useEffect(() => {
    form.clearErrors();
    formState?.errors?.forEach(({ path, message }) => {
      if (path[0] && message) {
        form.setError(path[0] as keyof LoginFormType, { message });
      }
    });
  }, [formState, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="flex flex-col gap-4 items-center">
        <FormMessage>{formState.error}</FormMessage>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Email</FormLabel>
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
              <FormLabel>Password</FormLabel>
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
