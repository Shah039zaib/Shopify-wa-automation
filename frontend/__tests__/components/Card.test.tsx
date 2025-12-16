import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').parentElement || screen.getByText('Content');
    expect(card).toHaveClass('bg-white', 'rounded-xl');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content');
    expect(card.parentElement || card).toHaveClass('custom-class');
  });
});

describe('CardHeader Component', () => {
  it('renders header with children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('applies border styles', () => {
    render(<CardHeader>Header</CardHeader>);
    const header = screen.getByText('Header');
    expect(header.parentElement || header).toHaveClass('border-b');
  });
});

describe('CardTitle Component', () => {
  it('renders title with children', () => {
    render(<CardTitle>Title Text</CardTitle>);
    expect(screen.getByText('Title Text')).toBeInTheDocument();
  });

  it('renders as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies font styles', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('font-semibold');
  });
});

describe('CardContent Component', () => {
  it('renders content with children', () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('applies padding', () => {
    render(<CardContent>Content</CardContent>);
    const content = screen.getByText('Content');
    expect(content.parentElement || content).toHaveClass('p-6');
  });
});

describe('Card Composition', () => {
  it('renders complete card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Card</CardTitle>
        </CardHeader>
        <CardContent>This is the content</CardContent>
      </Card>
    );

    expect(screen.getByText('My Card')).toBeInTheDocument();
    expect(screen.getByText('This is the content')).toBeInTheDocument();
  });
});
