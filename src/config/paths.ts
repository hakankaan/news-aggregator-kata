export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  articles: {
    path: '/articles',
    getHref: () => '/articles',
  },
} as const;
