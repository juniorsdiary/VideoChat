import React from 'react';
import Document, {
    Head, Main, NextScript, DocumentProps, DocumentContext,
} from 'next/document';

export default class MyDocument extends Document<DocumentProps> {
    static async getInitialProps(ctx: DocumentContext) {
        // extract the initial props that may be present.
        const initialProps = await Document.getInitialProps(ctx);

        // returning the original props together with our styled components.
        return {
            ...initialProps,
        };
    }

    render(): JSX.Element {
        return (
            <html lang="en" dir="ltr">
                <Head>
                    <meta charSet="utf-8" />

                    {/* Use minimum-scale=1 to enable GPU rasterization */}
                    <meta
                        key="viewport"
                        name="viewport"
                        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                    <script src="//cdn.jsdelivr.net/npm/eruda" />
                </body>
            </html>
        );
    }
}
