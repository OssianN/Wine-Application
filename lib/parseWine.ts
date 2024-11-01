import { positionSchema, wineFormSchema } from './schemas';

export const parseWine = async (
  formData: FormData,
  shelf?: string,
  column?: string
) => {
  const formTitle = formData.get('title') as string;
  const formYear = formData.get('year') as string;
  const formPrice = formData.get('price') as string;
  const formComment = formData.get('comment') as string;

  const [{ error, data }, { error: positionError, data: positionData }] =
    await Promise.all([
      wineFormSchema.safeParseAsync({
        title: formTitle,
        year: formYear,
        price: formPrice,
        comment: formComment,
      }),
      isNotNullOrUndefined(shelf) && isNotNullOrUndefined(column)
        ? positionSchema.safeParseAsync({
            shelf,
            column,
          })
        : { error: null, data: null },
    ]);

  return {
    data,
    positionData,
    errors: [...(error?.errors ?? []), ...(positionError?.errors ?? [])],
    isError: error || positionError,
  };
};

const isNotNullOrUndefined = (value: unknown) => {
  return value !== null && value !== undefined;
};
