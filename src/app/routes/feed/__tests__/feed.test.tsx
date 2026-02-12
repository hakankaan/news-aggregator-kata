import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { setLocalStorageItem } from '@/test/setup';
import { server, emptyResponseHandlers } from '@/test/mocks';
import FeedRoute from '../index';

const PREFERENCES_KEY = 'news-preferences';

describe('Feed Page Integration', () => {
  describe('Initial State (No Preferences)', () => {
    it('shows setup prompt when no preferences set', () => {
      render(<FeedRoute />);

      expect(screen.getByRole('heading', { name: /my feed/i })).toBeInTheDocument();
      expect(screen.getByText(/set up your preferences/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /set preferences/i })).toBeInTheDocument();
    });

    it('shows link to all articles', () => {
      render(<FeedRoute />);

      expect(screen.getByRole('link', { name: /all articles/i })).toBeInTheDocument();
    });

    it('does not show article list when no preferences', () => {
      render(<FeedRoute />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('With Preferences', () => {
    beforeEach(() => {
      setLocalStorageItem(PREFERENCES_KEY, {
        preferredSources: ['newsapi'],
        preferredCategories: ['technology'],
        preferredAuthors: [],
      });
    });

    it('shows preferences info banner', async () => {
      render(<FeedRoute />);

      await waitFor(() => {
        expect(screen.getByText(/showing articles based on your preferences/i)).toBeInTheDocument();
      });
    });

    it('shows preferences button in header', async () => {
      render(<FeedRoute />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /preferences/i })).toBeInTheDocument();
      });
    });

    it('loads and displays articles', async () => {
      render(<FeedRoute />);

      expect(screen.getByRole('status')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      const readMoreLinks = screen.getAllByRole('link', { name: /read more/i });
      expect(readMoreLinks.length).toBeGreaterThan(0);
    });

    it('shows empty state when no articles match preferences', async () => {
      server.use(...emptyResponseHandlers);

      render(<FeedRoute />);

      await waitFor(() => {
        expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Preferences Modal', () => {
    it('opens preferences modal when Set Preferences is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Preferred Sources')).toBeInTheDocument();
      expect(screen.getByText('Preferred Categories')).toBeInTheDocument();
      expect(screen.getByText('Preferred Authors')).toBeInTheDocument();
    });

    it('toggles source preference', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const newsapiBadge = screen.getByRole('button', { name: /newsapi/i });
      await user.click(newsapiBadge);

      await user.click(newsapiBadge);
    });

    it('toggles category preference', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const techBadge = screen.getByRole('button', { name: /technology/i });
      await user.click(techBadge);
    });

    it('adds author preference', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const authorInput = screen.getByPlaceholderText(/author name/i);
      await user.type(authorInput, 'John Doe');

      await user.click(screen.getByRole('button', { name: /^add$/i }));

      expect(screen.getByRole('button', { name: /john doe/i })).toBeInTheDocument();
    });

    it('removes author preference', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const authorInput = screen.getByPlaceholderText(/author name/i);
      await user.type(authorInput, 'Jane Smith');
      await user.click(screen.getByRole('button', { name: /^add$/i }));

      const authorBadge = screen.getByRole('button', { name: /jane smith/i });
      expect(authorBadge).toBeInTheDocument();

      await user.click(authorBadge);

      expect(screen.queryByRole('button', { name: /jane smith/i })).not.toBeInTheDocument();
    });

    it('resets preferences', async () => {
      const user = userEvent.setup();

      setLocalStorageItem(PREFERENCES_KEY, {
        preferredSources: ['newsapi', 'gnews'],
        preferredCategories: ['technology', 'science'],
        preferredAuthors: ['Test Author'],
      });

      render(<FeedRoute />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /preferences/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.queryByRole('button', { name: /test author/i })).not.toBeInTheDocument();
    });

    it('saves preferences and closes modal', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /gnews/i }));

      await user.click(screen.getByRole('button', { name: /done/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/showing articles based on your preferences/i)).toBeInTheDocument();
      });
    });

    it('closes modal without saving when clicking X', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await user.click(screen.getByRole('button', { name: /set preferences/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/set up your preferences/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has link to all articles page', () => {
      render(<FeedRoute />);

      const link = screen.getByRole('link', { name: /all articles/i });
      expect(link).toHaveAttribute('href', '/articles');
    });
  });

  describe('Infinite Scroll (With Preferences)', () => {
    beforeEach(() => {
      setLocalStorageItem(PREFERENCES_KEY, {
        preferredSources: ['newsapi'],
        preferredCategories: ['technology'],
        preferredAuthors: [],
      });
    });

    it('shows load more button when has more articles', async () => {
      render(<FeedRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /load more articles/i })).toBeInTheDocument();
    });

    it('loads more articles when clicking load more', async () => {
      const user = userEvent.setup();
      render(<FeedRoute />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      const initialArticleCount = screen.getAllByRole('link', { name: /read more/i }).length;

      await user.click(screen.getByRole('button', { name: /load more articles/i }));

      await waitFor(() => {
        expect(screen.getAllByRole('link', { name: /read more/i }).length).toBeGreaterThan(initialArticleCount);
      });
    });
  });
});
