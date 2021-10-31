const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {

  let baseConfig = {
    reactStrictMode: true,
    experimental: {
      esmExternals: false
    }
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...baseConfig,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
          config.resolve.fallback.net = false;
          config.resolve.fallback.tls = false;
        }
        return config;
      }
    }
  }
  else {
    return withPWA({
      ...baseConfig,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
          config.resolve.fallback.net = false;
          config.resolve.fallback.tls = false;
        }
        return config;
      },
      pwa: {
        dest: 'public',
        runtimeCaching,
        maximumFileSizeToCacheInBytes: 10000000
      },
      experimental: {
        esmExternals: false,
        optimizeCss: true
      },
      target: "experimental-serverless-trace",
      poweredByHeader: false
    })
  }

}
