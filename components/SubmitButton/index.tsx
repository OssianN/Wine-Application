import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

type SubmitButtonProps = {
  buttonText: string;
};

export const SubmitButton = ({ buttonText }: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button className="w-20" type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : buttonText}
    </Button>
  );
};
