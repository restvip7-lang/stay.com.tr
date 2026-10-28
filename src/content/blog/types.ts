import type { Lang } from '../../i18n/config';

export interface ArticleText {
  title: string;
  description: string;
  body: string;
  faq?: { q: string; a: string }[];
}

export interface Article {
  slug: string;
  cat: 'laws' | 'area-guides';
  published: string;
  updated: string;
  image: string | null;
  /** Переводы статьи: hreflang только между ними. */
  tr: Partial<Record<Lang, ArticleText>>;
  /** Для гайдов: гео, к которому относится статья. */
  geo?: { country: string; city: string; district?: string };
}
