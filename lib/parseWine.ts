import { wineFormSchema } from './schemas';

export const parseWine = (
  formData: FormData,
  shelf?: string,
  column?: string,
  isUpdated: boolean = false
) => {
  const formYear = Number(formData.get('year'));
  const formPrice = Number(formData.get('price'));

  const title = formData.get('title') as string;
  const comment = formData.get('comment') as string;
  const year = isNaN(formYear) ? 'string' : formYear;
  const price = isNaN(formPrice) ? 'string' : formPrice;

  const parse = wineFormSchema.safeParse({
    title,
    year,
    price,
    comment,
  });

  const positionError = isUpdated
    ? false
    : isNaN(Number(shelf)) || isNaN(Number(column));

  return {
    title,
    year: year as number,
    price: price as number,
    comment,
    errors: parse.error?.errors,
    shelf: Number(shelf),
    column: Number(column),
    isError: !parse.success || positionError,
  };
};
