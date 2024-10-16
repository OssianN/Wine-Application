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
import { updateStorageSize } from '@/mongoDB/updateStorageSize';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { storageSizeSchema } from '@/lib/schemas';
import type { User } from '@/types';

type ChangeStorageFormProps = {
  user: Pick<User, 'columns' | 'shelves' | 'name'>;
  onOpenSettingsChange: (open: boolean) => void;
};

const initialState: {
  isSubmitted?: boolean;
  error?: boolean;
  errorMessage?: string;
  updatedStorageSize?: { shelves: number; columns: number };
} = {};

export const ChangeStorageForm = ({
  user,
  onOpenSettingsChange,
}: ChangeStorageFormProps) => {
  const form = useForm<StorageSizeType>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(storageSizeSchema),
    defaultValues: {
      shelves: user.shelves,
      columns: user.columns,
    },
  });

  const serverAction = (prev: unknown, formData: FormData) =>
    updateStorageSize<typeof initialState>(prev, formData);
  const [formState, formAction] = useFormState(serverAction, initialState);

  useEffect(() => {
    if (formState.isSubmitted) {
      onOpenSettingsChange(false);
    }
  }, [formState.isSubmitted, onOpenSettingsChange]);

  return (
    <Form {...form}>
      <form action={formAction} className="flex flex-col gap-4 items-center">
        <FormField
          control={form.control}
          name="shelves"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Shelves</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  inputMode="numeric"
                  className="resize-none"
                  placeholder={String(user.shelves + 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="columns"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Columns</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="resize-none"
                  type="number"
                  inputMode="numeric"
                  placeholder={String(user.columns + 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Update
        </Button>
      </form>
    </Form>
  );
};

type StorageSizeType = z.infer<typeof storageSizeSchema>;
