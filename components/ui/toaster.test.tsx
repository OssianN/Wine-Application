/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { Toaster } from './toaster';
import { toast } from '@/hooks/use-toast';

const ShowLibraryUpdatedToast = () => {
  useEffect(() => {
    toast({
      title: 'Library updated',
      description: 'Updated 39 wines. 90 skipped, 0 failed.',
    });
  }, []);
  return null;
};

describe('Toaster', () => {
  it('renders library-updated copy in a full-width left-aligned block', async () => {
    render(
      <>
        <Toaster />
        <ShowLibraryUpdatedToast />
      </>
    );

    const title = await screen.findByText('Library updated');
    expect(
      screen.getByText('Updated 39 wines. 90 skipped, 0 failed.')
    ).toBeInTheDocument();

    const copy = title.parentElement;
    expect(copy).toHaveClass('w-full', 'min-w-0', 'text-left');
  });
});
