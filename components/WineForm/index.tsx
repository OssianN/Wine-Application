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
import { z } from 'zod';
import { postNewWine } from '@/mongoDB/postNewWine';
import { Wine } from '@/types';
import { updateWine } from '@/mongoDB/updateWine';
import { cn } from '@/lib/utils';
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
  isSubmitted?: boolean;
  error?: undefined;
  errorMessage?: '';
  updatedWine?: Wine;
} = {};

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
    mode: 'all',
    reValidateMode: 'onBlur',
    resolver: zodResolver(wineFormSchema),
    defaultValues: {
      title: wine?.title ?? '',
      year: String(wine?.year) ?? '',
      price: String(wine?.price) ?? '',
      comment: wine?.comment ?? '',
    },
  });

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
                <Input {...field} className="resize-none" />
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
                    className={cn('resize-none', hideNumberSpinners)}
                    type="number"
                    min="1900"
                    max="2100"
                    step="1"
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
                    className={cn('resize-none', hideNumberSpinners)}
                    type="number"
                    min="0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shelf"
          render={({ field }) => (
            <FormItem className="hidden" aria-label="hidden">
              <FormControl>
                <Input
                  {...field}
                  className={cn('resize-none', hideNumberSpinners)}
                  type="number"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="column"
          render={({ field }) => (
            <FormItem className="hidden" aria-label="hidden">
              <FormControl>
                <Input
                  {...field}
                  className={cn('resize-none', hideNumberSpinners)}
                  type="number"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Comment </FormLabel>
              <FormControl>
                <Input {...field} className="resize-none" />
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

type WineFormType = z.infer<typeof wineFormSchema>;

const hideNumberSpinners =
  'appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
