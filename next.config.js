const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      experimental: {
        optimizeCss:true
      },
      maximumFileSizeToCacheInBytes: 5000000,
      reactStrictMode: true,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
          config.resolve.fallback.net = false;
          config.resolve.fallback.tls = false;
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
      maximumFileSizeToCacheInBytes: 5000000,
      target: "experimental-serverless-trace",
      poweredByHeader: false,
      reactStrictMode: true,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
          config.resolve.fallback.net = false;
          config.resolve.fallback.tls = false;
        }
        return config;
      },
   })
}
