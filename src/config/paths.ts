export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  news: {
    path: '/news',
    getHref: () => '/news',
  },
  newsDetails: {
    path: '/news/:newsId',
    getHref: (id: string) => `/news/${id}`,
  },

} as const;
