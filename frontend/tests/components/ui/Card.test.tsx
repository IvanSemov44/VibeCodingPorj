import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/render';
import Card from '@/components/ui/Card';

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('should render with children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.tagName).toBe('DIV');
    });

    it('should have base classes', () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(
        'bg-[var(--card-bg)]',
        'border',
        'border-border',
        'rounded-xl',
        'shadow-sm',
      );
    });

    it('should render children in content section', () => {
      render(<Card>Main content</Card>);
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });
  });

  describe('Title Prop', () => {
    it('should not render title section when title is not provided', () => {
      const { container } = render(<Card>Content</Card>);
      const titleSection = container.querySelector('.border-b');
      expect(titleSection).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<Card title="Card Title">Content</Card>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render title with correct styling', () => {
      render(<Card title="Card Title">Content</Card>);
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass(
        'px-5',
        'py-4',
        'border-b',
        'border-border',
        'font-semibold',
        'text-primary-text',
      );
    });

    it('should render React node as title', () => {
      render(
        <Card
          title={
            <div>
              <strong>Bold Title</strong>
            </div>
          }
        >
          Content
        </Card>,
      );
      expect(screen.getByText('Bold Title')).toBeInTheDocument();
    });

    it('should render title with icon', () => {
      render(
        <Card
          title={
            <>
              🏠 <span>Home</span>
            </>
          }
        >
          Content
        </Card>,
      );
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should handle empty string as title', () => {
      const { container } = render(<Card title="">Content</Card>);
      const titleSection = container.querySelector('.border-b');
      // Empty string is falsy, so title section should not render
      expect(titleSection).not.toBeInTheDocument();
    });
  });

  describe('Footer Prop', () => {
    it('should not render footer section when footer is not provided', () => {
      const { container } = render(<Card>Content</Card>);
      const footerSection = container.querySelector('.border-t');
      expect(footerSection).not.toBeInTheDocument();
    });

    it('should render footer when provided', () => {
      render(<Card footer="Card Footer">Content</Card>);
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should render footer with correct styling', () => {
      render(<Card footer="Card Footer">Content</Card>);
      const footer = screen.getByText('Card Footer');
      expect(footer).toHaveClass('px-5', 'py-4', 'border-t', 'border-border', 'text-sm');
    });

    it('should render React node as footer', () => {
      render(
        <Card
          footer={
            <div>
              <button>Action</button>
            </div>
          }
        >
          Content
        </Card>,
      );
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render footer with links', () => {
      render(
        <Card
          footer={
            <a href="/more">
              Learn more →
            </a>
          }
        >
          Content
        </Card>,
      );
      const link = screen.getByText(/Learn more/);
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
    });

    it('should handle empty string as footer', () => {
      const { container } = render(<Card footer="">Content</Card>);
      const footerSection = container.querySelector('.border-t');
      // Empty string is falsy, so footer section should not render
      expect(footerSection).not.toBeInTheDocument();
    });
  });

  describe('Children Content', () => {
    it('should render text children', () => {
      render(<Card>Simple text content</Card>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Card>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </Card>,
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('should render complex nested children', () => {
      render(
        <Card>
          <div>
            <h3>Heading</h3>
            <p>Description</p>
            <button>Action</button>
          </div>
        </Card>,
      );
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render content with correct padding', () => {
      render(<Card>Content</Card>);
      const content = screen.getByText('Content');
      expect(content).toHaveClass('p-5');
    });

    it('should render numeric content', () => {
      render(<Card>{123}</Card>);
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should not add extra class when className is not provided', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('custom-class');
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should preserve base classes when custom className is provided', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--card-bg)]', 'border', 'rounded-xl', 'custom-class');
    });

    it('should handle multiple custom classes', () => {
      const { container } = render(<Card className="class1 class2 class3">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('Complete Card with All Props', () => {
    it('should render title, children, and footer together', () => {
      render(
        <Card title="Card Title" footer="Card Footer">
          Card Content
        </Card>,
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should render with all props including className', () => {
      const { container } = render(
        <Card title="Title" footer="Footer" className="my-card">
          Content
        </Card>,
      );
      const card = container.firstChild as HTMLElement;
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
      expect(card).toHaveClass('my-card');
    });

    it('should maintain correct structure with all sections', () => {
      const { container } = render(
        <Card title="Title" footer="Footer">
          Content
        </Card>,
      );
      const card = container.firstChild as HTMLElement;
      const sections = card.children;
      expect(sections).toHaveLength(3); // title, content, footer
    });
  });

  describe('Styling and Layout', () => {
    it('should have border styling', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border', 'border-border');
    });

    it('should have rounded corners', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-xl');
    });

    it('should have shadow', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-sm');
    });

    it('should have background color', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--card-bg)]');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle very long content', () => {
      const longContent = 'Lorem ipsum '.repeat(100);
      render(<Card>{longContent}</Card>);
      expect(screen.getByText(new RegExp('Lorem ipsum'))).toBeInTheDocument();
    });

    it('should render card with form', () => {
      render(
        <Card title="Login Form">
          <form>
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <button type="submit">Submit</button>
          </form>
        </Card>,
      );
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should render card with list', () => {
      render(
        <Card title="Items">
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </Card>,
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render card with image', () => {
      render(
        <Card title="Profile">
          <img src="/avatar.jpg" alt="User Avatar" />
          <p>User Name</p>
        </Card>,
      );
      expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
      expect(screen.getByText('User Name')).toBeInTheDocument();
    });

    it('should handle nested cards', () => {
      render(
        <Card title="Outer Card">
          <Card title="Inner Card">Inner Content</Card>
        </Card>,
      );
      expect(screen.getByText('Outer Card')).toBeInTheDocument();
      expect(screen.getByText('Inner Card')).toBeInTheDocument();
      expect(screen.getByText('Inner Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null in children', () => {
      render(
        <Card>
          Content {null} more content
        </Card>,
      );
      expect(screen.getByText(/Content.*more content/)).toBeInTheDocument();
    });

    it('should handle boolean values in children', () => {
      render(
        <Card>
          {true && 'Visible'}
          {false && 'Hidden'}
        </Card>,
      );
      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('should handle undefined className gracefully', () => {
      const { container } = render(<Card className={undefined}>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('should handle numeric title', () => {
      render(<Card title={<span>{42}</span>}>Content</Card>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle numeric footer', () => {
      render(<Card footer={<span>{99}</span>}>Content</Card>);
      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as a profile card', () => {
      render(
        <Card
          title="User Profile"
          footer={
            <button>Edit Profile</button>
          }
        >
          <p>Name: John Doe</p>
          <p>Email: john@example.com</p>
        </Card>,
      );
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Name: John Doe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
    });

    it('should work as a settings card', () => {
      render(
        <Card
          title="Settings"
          footer={
            <>
              <button>Cancel</button>
              <button>Save</button>
            </>
          }
        >
          <label>
            <input type="checkbox" /> Enable notifications
          </label>
        </Card>,
      );
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should work as a simple content container', () => {
      render(<Card>Just some plain text content without title or footer.</Card>);
      expect(
        screen.getByText('Just some plain text content without title or footer.'),
      ).toBeInTheDocument();
    });
  });
});
