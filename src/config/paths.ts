export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  articles: {
    path: '/articles',
    getHref: () => '/articles',
  },
  feed: {
    path: '/feed',
    getHref: () => '/feed',
  },
} as const;
