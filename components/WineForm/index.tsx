'use client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodIssue } from 'zod';
import { postNewWine } from '@/mongoDB/postNewWine';
import { Wine } from '@/types';
import { updateWine } from '@/mongoDB/updateWine';

import {
  useContext,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useFormState } from 'react-dom';
import { WineContext } from '@/providers/WineProvider';
import { SubmitButton } from '../SubmitButton';
import { wineFormSchema } from '@/lib/schemas';

type WineFormProps = {
  wine?: Wine | null;
  setOpenWineForm?: Dispatch<SetStateAction<boolean>>;
  column?: string;
  shelf?: string;
};

export const initialState: {
  errors: ZodIssue[];
  errorMessage?: string;
  isSubmitted?: boolean;
  updatedWine?: Wine;
} = {
  errors: [
    {
      path: [],
      message: '',
      code: 'custom',
    },
  ],
};

export const WineForm = ({
  wine,
  setOpenWineForm,
  column,
  shelf,
}: WineFormProps) => {
  const serverAction = (prev: unknown, formData: FormData) =>
    wine
      ? updateWine<typeof initialState>(prev, formData, wine?._id ?? '')
      : postNewWine<typeof initialState>(prev, formData, column, shelf);

  const { setOpenWineFormDialog, handleOpenWineDialog } =
    useContext(WineContext);
  const [formState, formAction] = useFormState(serverAction, initialState);

  const form = useForm<WineFormType>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(wineFormSchema),
    defaultValues: {
      title: wine?.title ?? '',
      year: wine?.year ? String(wine?.year) : '',
      price: wine?.price ? String(wine?.price) : '',
      comment: wine?.comment ?? '',
    },
  });

  useEffect(() => {
    form.clearErrors();
    formState?.errors?.forEach(({ path, message }) => {
      form.setError(path[0] as keyof WineFormType, { message });
    });
  }, [formState, form]);

  useEffect(() => {
    if (!formState?.isSubmitted) return;

    if (setOpenWineForm) {
      setOpenWineForm(false);
    }

    if (setOpenWineFormDialog) {
      setOpenWineFormDialog(false);
    }

    if (formState.updatedWine) {
      handleOpenWineDialog(formState.updatedWine);
    }
  }, [formState, handleOpenWineDialog, setOpenWineForm, setOpenWineFormDialog]);

  return (
    <Form {...form}>
      <form action={e => formAction(e)} className="flex flex-col gap-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="resize-none"
                  inputMode="text"
                  step="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-8 md:flex-row">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="resize-none"
                    inputMode="numeric"
                    step="2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="resize-none"
                    inputMode="numeric"
                    step="3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Comment </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="resize-none"
                  inputMode="text"
                  step="4"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end gap-4">
          {setOpenWineForm && (
            <Button
              className="w-20"
              variant="outline"
              type="button"
              onClick={() => setOpenWineForm(false)}
            >
              Cancel
            </Button>
          )}
          <SubmitButton buttonText="Submit" />
        </div>
      </form>
    </Form>
  );
};

type WineFormType = {
  title: string;
  year: string;
  price: string;
  comment: string;
};
