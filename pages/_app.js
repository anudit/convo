import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Global, css } from '@emotion/react';
import Head from 'next/head'
import PropTypes from 'prop-types';

import customTheme from '@/styles/theme';
import { RainbowContextProvider } from '@/contexts/RainbowContext';

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
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 100;
            font-display: swap;
            src: url('/fonts/Montserrat-Regular.woff2') format('woff2');
          }
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('/fonts/Montserrat-Medium.woff2') format('woff2');
          }
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: url('/fonts/Montserrat-Bold.woff2') format('woff2');
          }
          body {
            font-family: "Montserrat", "Segoe UI" !important;
            overflow-x:hidden;
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
          .oh {
            overflow: hidden !important;
          }
          .tp {
            background: none !important;
            background-color: transparent !important;
          }
          .grow { transition: all .2s ease-in-out; }
          .grow:hover { transform: scale(1.01);}
          .gradientShadow::before {
            content: "";
            position: absolute;
            z-index: -1;
            -webkit-filter: blur(1px);
            filter: blur(10px);
            background: conic-gradient(from 217.29deg at 51.63% 52.16%, #2563EB 0deg , #0EA5E9 19.5deg , #EC4899 102.75deg , #F43F5E 152.25deg , #EF4444 208.88deg , #6366F1 291deg );
            width: 243px;
            height: 35px;
            margin: -8px;
          }
          .br-10 {
            border-radius:10px;
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
          .typewrite::after {
            content: "|";
            animation: blink 1s infinite;
            color: #e8a7b6;
          }
          @keyframes blink {
            0%, 100% {opacity: 1;}
            50% {opacity: 0;}
          }
          .chakra-wrap__list {
            justify-content: center !important;
          }
        .gradient-title {
          background: -webkit-linear-gradient(160deg, rgba(182,204,255,1) 0%, rgba(253,192, 206,1) 100%);
          background: linear-gradient(160deg, rgba(182,204,255,1) 0%, rgba(253,192, 206,1) 100%)
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          boxDecorationBreak="clone"
        }
        `}
      />
      {children}
    </>
  );
};

GlobalStyle.propTypes = {
  children: PropTypes.element
}

const App = ({ Component, pageProps }) => {
  return (
    <RainbowContextProvider>
        <ChakraProvider theme={customTheme} resetCSS>
            <GlobalStyle />
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Component {...pageProps} />
        </ChakraProvider>
    </RainbowContextProvider>
  )
}

App.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object
}

export default App
