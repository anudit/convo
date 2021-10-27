const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {

  let baseConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback.fs = false;
        config.resolve.fallback.net = false;
        config.resolve.fallback.tls = false;
      }
      return config;
    }
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {...baseConfig}
  }

  return withPWA({
    ...baseConfig,
    pwa: {
      dest: 'public',
      runtimeCaching,
      maximumFileSizeToCacheInBytes: 10000000
    },
    experimental: {
      optimizeCss:true
    },
    target: "experimental-serverless-trace",
    poweredByHeader: false
  })
}
