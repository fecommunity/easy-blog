import { Categories } from '@components/Categories';
import { Footer } from '@components/Footer';
import { KnowledgeList } from '@components/KnowledgeList';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { KnowledgeProvider } from '@/providers/knowledge';

import styles from '../index.module.scss';

interface IHomeProps {
  books: IKnowledge[];
  total: number;
}

const pageSize = 12;

const Page: NextPage<IHomeProps> = ({ books: defaultBooks = [], total = 0 }) => {
  const { categories, setting } = useContext(GlobalContext);
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<IKnowledge[]>(defaultBooks);

  useEffect(() => {
    setBooks(defaultBooks);
  }, [defaultBooks]);

  const getArticles = useCallback((page) => {
    KnowledgeProvider.getKnowledges({
      page,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(page);
      setBooks((articles) => [...articles, ...res[0]]);
    });
  }, []);

  return (
    <>
      <DoubleColumnLayout
        leftNode={
          <InfiniteScroll
            pageStart={1}
            loadMore={getArticles}
            hasMore={page * pageSize < total}
            loader={
              <div className={'loading'} key={0}>
                {t('gettingKnowledge')}
              </div>
            }
          >
            <KnowledgeList knowledges={books} />
          </InfiniteScroll>
        }
        rightNode={
          <div className={'sticky'}>
            <ArticleRecommend mode="inline" />
            <Categories categories={categories} />
          </div>
        }
      />
      <Footer className={styles.footer} setting={setting} />
    </>
  );
};

// 服务端预取数据
Page.getInitialProps = async () => {
  const [books, total] = await KnowledgeProvider.getKnowledges({
    page: 1,
    pageSize,
    status: 'publish',
  });
  return {
    books,
    total,
    needLayoutFooter: false,
  };
};

export default Page;
