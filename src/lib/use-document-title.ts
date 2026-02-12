import { useEffect } from 'react';

const BASE_TITLE = 'News Aggregator';

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
