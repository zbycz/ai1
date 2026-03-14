import React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import type { DocumentContext } from 'next/dist/shared/lib/utils';
import {
  documentGetInitialProps,
  DocumentHeadTags,
  DocumentHeadTagsProps,
} from '@mui/material-nextjs/v13-pagesRouter';

type Props = DocumentHeadTagsProps;

class MyDocument extends Document<Props> {
  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <DocumentHeadTags emotionStyleTags={this.props.emotionStyleTags} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx: DocumentContext) =>
  documentGetInitialProps(ctx);

export default MyDocument;
