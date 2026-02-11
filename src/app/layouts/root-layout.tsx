import { NavLink, Outlet } from 'react-router';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';
import { Newspaper, Sparkles } from 'lucide-react';

export const RootLayout = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <NavLink to={paths.home.getHref()} className="flex items-center gap-2 font-bold text-xl hover:opacity-80">
            <Newspaper className="size-6" />
            <span className='hidden sm:block'>News Aggregator</span>
          </NavLink>

          <nav className="flex items-center gap-1">
            <NavLink to={paths.home.getHref()} className={linkClass}>
              <Sparkles className="size-4" />
              My Feed
            </NavLink>
            <NavLink to={paths.articles.getHref()} className={linkClass}>
              <Newspaper className="size-4" />
              All Articles
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NewsAggregator
          </p>
        </div>
      </footer>
    </div>
  );
};


