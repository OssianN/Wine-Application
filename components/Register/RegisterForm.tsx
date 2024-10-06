'use client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodIssue } from 'zod';
import { registerNewUser } from '@/mongoDB/registerNewUser';
import { useFormState } from 'react-dom';
import { registerFormSchema } from '@/lib/schemas';
import { useEffect } from 'react';

const initialState: { errors: ZodIssue[] } = {
  errors: [
    {
      path: [],
      message: '',
      code: 'custom',
    },
  ],
};

export const RegisterForm = () => {
  const form = useForm<RegisterFormType>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm: '',
    },
  });

  const serverAction = (prev: unknown, formData: FormData) =>
    registerNewUser(prev, formData);
  const [formState, formAction] = useFormState(serverAction, initialState);

  useEffect(() => {
    formState?.errors.forEach(({ path, message }) => {
      form.setError(path[0] as keyof RegisterFormType, { message });
    });
  }, [formState]);

  return (
    <Form {...form}>
      <form action={formAction} className="flex flex-col gap-4 items-center">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input {...field} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input {...field} className="resize-none" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Register
        </Button>
      </form>
    </Form>
  );
};

type RegisterFormType = z.infer<typeof registerFormSchema>;
