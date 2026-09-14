import { render, screen } from '@testing-library/react';
import { DrinkingWindowBadge, DrinkingWindowLegend } from './DrinkingWindowCue';

describe('DrinkingWindowBadge', () => {
  it('renders a short label for drink-now bottles', () => {
    render(<DrinkingWindowBadge status={5} />);
    expect(screen.getByText('Drink now')).toBeInTheDocument();
  });

  it('renders a hold badge', () => {
    render(<DrinkingWindowBadge status={3} />);
    expect(screen.getByText('Hold')).toBeInTheDocument();
  });

  it('renders nothing for at-your-pace bottles', () => {
    const { container } = render(<DrinkingWindowBadge status={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('DrinkingWindowLegend', () => {
  it('lists the grid color meanings', () => {
    render(<DrinkingWindowLegend />);
    expect(
      screen.getByRole('list', { name: 'Drinking window colors' })
    ).toBeInTheDocument();
    expect(screen.getByText('Drink now')).toBeInTheDocument();
    expect(screen.getByText('Drink or hold')).toBeInTheDocument();
    expect(screen.getByText('Hold')).toBeInTheDocument();
    expect(screen.getByText('Past its peak')).toBeInTheDocument();
  });
});
