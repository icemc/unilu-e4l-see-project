import React from 'react';
import { render } from '@testing-library/react';
import { VerticalSpace } from '../../js/presentation/verticalSpace';

describe('VerticalSpace Integration Tests', () => {
  test('should render VerticalSpace component', () => {
    const { container } = render(<VerticalSpace vheight={2.5} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('should apply correct height based on vheight prop', () => {
    const { container } = render(<VerticalSpace vheight={3} />);
    const div = container.firstChild;
    expect(div).toHaveStyle({ height: '3em' });
  });

  test('should handle decimal vheight values', () => {
    const { container } = render(<VerticalSpace vheight={2.5} />);
    const div = container.firstChild;
    expect(div).toHaveStyle({ height: '2.5em' });
  });

  test('should handle zero vheight', () => {
    const { container } = render(<VerticalSpace vheight={0} />);
    const div = container.firstChild;
    expect(div).toHaveStyle({ height: '0em' });
  });

  test('should render a div element', () => {
    const { container } = render(<VerticalSpace vheight={1} />);
    expect(container.firstChild.tagName).toBe('DIV');
  });
});
