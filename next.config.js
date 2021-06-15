const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      experimental: {
        optimizeCss:true
      },
      reactStrictMode: true,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
        }
        return config;
      },
    }
  }

  return withPWA({
      experimental: {
        optimizeCss:true
      },
      pwa: {
        dest: 'public',
        runtimeCaching,
      },
      target: "experimental-serverless-trace",
      poweredByHeader: false,
      reactStrictMode: true,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
        }
        return config;
      },
   })
}
