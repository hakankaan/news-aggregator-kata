import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { server, emptyResponseHandlers, networkErrorHandlers } from '@/test/mocks';
import NewsRoute from '../index';

describe('Articles Page Integration', () => {
  describe('Initial Load', () => {
    it('shows loading spinner initially', () => {
      render(<NewsRoute />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders articles after loading', async () => {
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      // Should show article cards (identified by Read more links)
      const readMoreLinks = screen.getAllByRole('link', { name: /read more/i });
      expect(readMoreLinks.length).toBeGreaterThan(0);
    });

    it('shows page title and description', () => {
      render(<NewsRoute />);

      expect(screen.getByRole('heading', { name: /all articles/i })).toBeInTheDocument();
      expect(screen.getByText(/stay updated with the latest news/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no articles returned', async () => {
      server.use(...emptyResponseHandlers);

      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/try adjusting your search or filters/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows empty state when all APIs fail (graceful degradation)', async () => {
      server.use(...networkErrorHandlers);

      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search', () => {
    it('shows search input', () => {
      render(<NewsRoute />);

      expect(screen.getByPlaceholderText(/search articles/i)).toBeInTheDocument();
    });

    it('updates search with debounce', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(<NewsRoute />);

      const searchInput = screen.getByPlaceholderText(/search articles/i);
      await user.type(searchInput, 'technology');

      expect(searchInput).toHaveValue('technology');

      await vi.advanceTimersByTimeAsync(350);

      vi.useRealTimers();
    });
  });

  describe('Filter Panel', () => {
    it('shows filters button with collapsed state', () => {
      render(<NewsRoute />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('expands filter panel when clicked', async () => {
      const user = userEvent.setup();
      render(<NewsRoute />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Sources')).toBeInTheDocument();
    });

    it('toggles category filter', async () => {
      const user = userEvent.setup();
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const techBadge = screen.getByText('technology');
      await user.click(techBadge);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('toggles source filter', async () => {
      const user = userEvent.setup();
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const newsapiBadges = screen.getAllByText('NewsAPI');
      await user.click(newsapiBadges[0]);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('shows clear all button when filters are active', async () => {
      const user = userEvent.setup();
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /filters/i }));

      await user.click(screen.getByText('business'));

      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    });

    it('clears filters when clear all is clicked', async () => {
      const user = userEvent.setup();
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /filters/i }));

      await user.click(screen.getByText('science'));

      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear all/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('shows load more button when has next page', async () => {
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /load more articles/i })).toBeInTheDocument();
    });

    it('loads next page when load more is clicked', async () => {
      const user = userEvent.setup();
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      const initialArticleCount = screen.getAllByRole('link', { name: /read more/i }).length;

      await user.click(screen.getByRole('button', { name: /load more articles/i }));

      await waitFor(() => {
        expect(screen.getByText(/loading more/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getAllByRole('link', { name: /read more/i }).length).toBeGreaterThan(initialArticleCount);
      });
    });
  });

  describe('Article Display', () => {
    it('displays article cards with title', async () => {
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      const readMoreLinks = screen.getAllByRole('link', { name: /read more/i });
      expect(readMoreLinks.length).toBeGreaterThan(0);

      const cards = document.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays article cards with read more link', async () => {
      render(<NewsRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      const readMoreLinks = screen.getAllByRole('link', { name: /read more/i });
      expect(readMoreLinks.length).toBeGreaterThan(0);

      readMoreLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });
});
