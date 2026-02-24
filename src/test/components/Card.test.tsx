import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../components/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Card description="Card description">Content</Card>);
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <Card action={<button>Action</button>}>
        Content
      </Card>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has correct base styles', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('rounded-xl');
    expect(container.firstChild).toHaveClass('shadow-sm');
    expect(container.firstChild).toHaveClass('border');
  });
});
