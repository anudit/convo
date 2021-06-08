import { ColorModeScript } from "@chakra-ui/react"
import Document, { Html, Head, Main, NextScript } from 'next/document'
import theme from "../styles/theme";

class MyDocument extends Document {

    render() {

        return (
            <Html lang="en">
                <Head>
                    <meta name='application-name' content='The Convo Space' />
                    <meta name='apple-mobile-web-app-capable' content='yes' />
                    <meta name='apple-mobile-web-app-status-bar-style' content='default' />
                    <meta name='apple-mobile-web-app-title' content='The Convo Space' />
                    <meta name='description' content='The Decentralized Conversation Layer of Internet' />
                    <meta name='format-detection' content='telephone=no' />
                    <meta name='mobile-web-app-capable' content='yes' />
                    <meta name='theme-color' content="#000" />
                    <link rel='icon' type='image/svg' sizes='512x512' href='/icons/icon.svg' />
                    <link rel='shortcut icon' href='/icons/icon.svg' />
                    <link rel='apple-touch-icon' sizes='180x180' href='/icons/icon.svg' />
                    <link rel='manifest' href='/manifest.json' />
                    <link rel="search" href="/open-search.xml" title="Search Convo" type="application/opensearchdescription+xml"></link>
                    <link rel='mask-icon' href='/icons/icon.svg' color='#5bbad5' />
                    <meta name='twitter:card' content='summary' />
                    <meta name='twitter:url' content='https://theconvo.space' />
                    <meta name='twitter:title' content='The Convo Space' />
                    <meta name='twitter:description' content='The Decentralized Conversation Layer of Internet' />
                    <meta name='twitter:image' content='https://theconvo.space/images/poster.png' />
                    <meta name='twitter:creator' content='@anuditnagar' />
                    <meta property='og:type' content='website' />
                    <meta property='og:title' content='The Convo Space' />
                    <meta property='og:description' content='The Decentralized Conversation Layer of Internet' />
                    <meta property='og:site_name' content='The Convo Space' />
                    <meta property='og:url' content='https://theconvo.space' />
                    <meta property='og:image' content='https://theconvo.space/images/poster.png' />
                    <script type='application/ld+json' dangerouslySetInnerHTML={ { __html: `{"@context": "http://www.schema.org","@type": "Corporation","name": "The Convo Space","url": "https://theconvo.space","logo": "https://theconvo.space/images/logo.png","image": "https://theconvo.space/images/poster.png","description": "The Decentralized Conversation Layer of Internet."}`}} />
                    <script type='application/ld+json' dangerouslySetInnerHTML={ { __html: `{"@context": "https://schema.org","@type": "Organization","url": "https://theconvo.space","logo": "https://theconvo.space/images/logo.png"}`}} />
                    <script type='application/ld+json' dangerouslySetInnerHTML={ { __html: `{"@context": "https://schema.org","@type": "WebSite","url": "https://theconvo.space","potentialAction": {"@type": "SearchAction","target": "https://theconvo.space/explore?search={searchTerms}","query-input": "required name=searchTerms"}}`}} />
                </Head>
                <body>
                    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
