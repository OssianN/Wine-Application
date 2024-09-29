'use client';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const Search = () => {
  const form = useForm<SearchFormType>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchWord: '',
    },
  });

  return (
    <Form {...form}>
      <form className="w-full flex justify-center">
        <FormField
          control={form.control}
          name="searchWord"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative flex max-w-96 flex-shrink">
                  <SearchIcon
                    size={16}
                    className={`absolute left-4 self-center opacity-50 ${
                      form.getValues('searchWord').length > 0
                        ? 'hidden'
                        : 'visible'
                    }`}
                  />
                  <Input {...field} className="resize-none rounded-full p-4" />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

const searchFormSchema = z.object({
  searchWord: z.string(),
});
type SearchFormType = z.infer<typeof searchFormSchema>;
