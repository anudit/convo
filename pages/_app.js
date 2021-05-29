
import { ChakraProvider } from "@chakra-ui/react";
import { Global, css } from '@emotion/react';
import Head from 'next/head'

import customTheme from '@/styles/theme';
import { Web3ContextProvider } from '@/contexts/Web3Context';

const GlobalStyle = ({ children }) => {
  return (
    <>
      <Global
        styles={css`
          html {
            min-width: 360px;
            scroll-behavior: smooth;
          }
          #__next {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          @font-face {
            font-family: 'GT Walsheim';
            font-style: normal;
            font-weight: 100;
            font-display: swap;
            src: url('/fonts/GTWalsheimPro-Regular.woff2') format('woff2');
          }
          @font-face {
            font-family: 'GT Walsheim';
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('/fonts/GTWalsheimPro-Medium.woff2') format('woff2');
          }
          @font-face {
            font-family: 'GT Walsheim';
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: url('/fonts/GTWalsheimPro-Bold.woff2') format('woff2');
          }
          body {
            font-family: "GT Walsheim", "Segoe UI" !important;
          }
          @-webkit-keyframes hue {
            from {
              -webkit-filter: hue-rotate(0deg);
            }
            to {
              -webkit-filter: hue-rotate(-360deg);
            }
          }
          .tp {
            background: none !important;
            background-color: transparent !important;
          }
          .gradientShadow::before {
            content: "";
            position: absolute;
            z-index: -1;
            -webkit-filter: blur(1px);
            filter: blur(10px);
            background: conic-gradient(from 217.29deg at 51.63% 52.16%, #2563EB 0deg , #0EA5E9 19.5deg , #EC4899 102.75deg , #F43F5E 152.25deg , #EF4444 208.88deg , #6366F1 291deg );
            width: 250px;
            height: 35px;
            margin: -15px;
          }
          .glow:hover::before {
            content: "";
            position: absolute;
            z-index: 0;
            -webkit-filter: blur(16px);
            filter: blur(16px);
            background: conic-gradient(from 217.29deg at 51.63% 52.16%, #2563EB 0deg , #0EA5E9 19.5deg , #EC4899 102.75deg , #F43F5E 152.25deg , #EF4444 208.88deg , #6366F1 291deg );
            width: 130px;
            height: 35px;
            mix-blend-mode: screen;
            margin-top: -7px;
            margin-left: -12px;
            animation: fadeIn linear 0.1s;
          }
          @keyframes fadeIn {
            0% {opacity:0;}
            100% {opacity:1;}
          }
        `}
      />
      {children}
    </>
  );
};

const App = ({ Component, pageProps }) => {
  return (
    <Web3ContextProvider>
      <ChakraProvider theme={customTheme} resetCSS>
          <GlobalStyle />
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <Component {...pageProps} />
      </ChakraProvider>
    </Web3ContextProvider>
  )
}

export default App
