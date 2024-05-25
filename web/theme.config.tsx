import React from 'react';
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { Move } from '@/components/move';

const config: DocsThemeConfig = {
  logo: Logo,
  project: {
    link: 'https://github.com/KernelPanic92/dungeonworld-ita',
  },
  docsRepositoryBase: 'https://github.com/KernelPanic92/dungeonworld-ita/tree/master/web',
  sidebar: {
    defaultMenuCollapseLevel: 1
  },
  i18n: [{
    text: 'Italiano',
    locale: 'it',
    direction: 'ltr'
  }],
 direction: 'ltr',
 feedback: {
  content: () => <>{'Lascia un feedback o una segnalazione →'}</>
 },
 search: {
   placeholder: 'Cerca nel sito',
   loading: 'Ricerca...',
   error: 'Qualcosa è andato storto nella ricerca 😵',
 },
 editLink: {
  text: 'Modifica questa pagina',
 },
  useNextSeoProps: () => {
    const { frontMatter , title: baseTitle} = useConfig();
    const description = frontMatter.description ?? 'Dungeon World in italiano';
    
    return {
      title: [frontMatter.title ?? baseTitle, 'Dungeon World in italiano'].filter(Boolean).join(' - '),
      description
    }
  },
  head: () => {
    const { frontMatter, title: baseTitle } = useConfig();
    const { asPath, defaultLocale, locale } = useRouter();
    const title = [frontMatter.title ?? baseTitle, 'Dungeon World in italiano'].filter(Boolean).join(' - ');
    const url =
    'https://dungeonworld-ita.vercel.app' +
    (defaultLocale === locale ? asPath : `/${locale}${asPath}`);

    const socialCard = frontMatter.image ? 'https://dungeonworld-ita.vercel.app' + frontMatter.image : 'https://dungeonworld-ita.vercel.app/images/dungeon-world-cover.webp';
    const description = frontMatter.description ?? 'Dungeon World in italiano';

    return (
      <>
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="it" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta
          name="description"
          content={description}
        />
        <meta
          name="og:description"
          content={description}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialCard} />
        <meta name="twitter:site:domain" content={title} />
        <meta name="twitter:url" content={url} />
        <meta
          name="og:title"
          content={title}
        />
        <meta name="og:image" content={socialCard} />
        <meta name="apple-mobile-web-app-title" content={title} />
        <link rel="icon" href="/favicon.ico" type="image/ico" />
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/ico"
          media="(prefers-color-scheme: dark)"
        />
      </>
    )
  },
  footer: {
    component: Footer,
  },
  components: {
    'Move': Move
  }
}

export default config
