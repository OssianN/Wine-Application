import { render, screen } from '@testing-library/react';
import {
  DrinkingWindowBadge,
  DrinkingWindowLegend,
  drinkingWindowCardClass,
} from './DrinkingWindowCue';

describe('drinkingWindowCardClass', () => {
  it('adds a status-colored left edge for drink-now bottles', () => {
    expect(drinkingWindowCardClass(5)).toContain('border-l-emerald-500');
    expect(drinkingWindowCardClass(4)).toContain('border-l-amber-500');
    expect(drinkingWindowCardClass(3)).toContain('border-l-sky-500');
    expect(drinkingWindowCardClass(6)).toContain('border-l-rose-500');
  });

  it('leaves quiet statuses without an accent', () => {
    expect(drinkingWindowCardClass(0)).toBeUndefined();
    expect(drinkingWindowCardClass(undefined)).toBeUndefined();
  });
});

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
