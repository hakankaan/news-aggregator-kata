import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInfinitePersonalizedFeed } from '@/features/feed/api/use-personalized-feed';
import { usePreferences } from '@/features/feed/stores/use-preferences';
import { PreferencesPanel } from '@/features/feed/components';
import { PreferencesProvider } from '@/features/feed/stores/preferences-provider';
import { InfiniteArticleList } from '@/features/shared/news/components';
import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';

const FeedContent = () => {
  const [showPreferences, setShowPreferences] = useState(false);
  const { preferences } = usePreferences();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfinitePersonalizedFeed({ preferences });

  const articles = data?.pages.flatMap((page) => page.items) ?? [];

  const hasPreferences =
    preferences.preferredSources.length > 0 ||
    preferences.preferredCategories.length > 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Feed</h1>
          <p className="text-muted-foreground">
            Personalized articles based on your preferences
          </p>
        </div>
        {hasPreferences && <Button variant="outline" onClick={() => setShowPreferences(true)}>
          <Settings className="size-4" />
          Preferences
        </Button>}
      </div>

      {/* Preferences Info */}
      {hasPreferences ? (
        <div className="bg-muted/50 mb-6 rounded-xl p-4">
          <p className="text-sm">
            Showing articles based on your preferences.
          </p>
        </div>
      ) : (
        <div className="bg-muted/50 mb-6 rounded-xl p-6 text-center">
          <p className="mb-4 text-muted-foreground">
            Set up your preferences to see personalized articles here.
          </p>
          <Button onClick={() => setShowPreferences(true)}>
            <Settings className="size-4" />
            Set Preferences
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Or browse{' '}
            <Link to={paths.articles.getHref()} className="underline underline-offset-2">
              all articles
            </Link>
          </p>
        </div>
      )}

      {/* Articles with Infinite Scroll */}
      {hasPreferences && (
        <InfiniteArticleList
          articles={articles}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          error={error}
        />
      )}

      {/* Preferences Modal */}
      <PreferencesPanel
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

const FeedRoute = () => (
  <PreferencesProvider>
    <FeedContent />
  </PreferencesProvider>
);

export default FeedRoute;
