// @ts-nocheck
import App, { AppContext } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const Layout = dynamic(import('../components/Layout/Layout'), { ssr: false });

class MyApp extends App<NextPage> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render(): JSX.Element {
        const { Component, pageProps } = this.props;

        return (
            <>
                <Head>
                    <title>WebRTC Practice</title>
                </Head>
                <Layout>
                    {Component && <Component {...pageProps} />}
                </Layout>
            </>
        );
    }
}

export default MyApp;
