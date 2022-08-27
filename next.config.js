const withPWA = require('next-pwa')({ dest: 'public' })
const runtimeCaching = require('next-pwa/cache')
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {

  let baseConfig = {
    reactStrictMode: true,
    experimental: {
      esmExternals: false
    },
    images: {
      domains: ['api.qrserver.com', 'qrserver.com'],
    },
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...baseConfig,
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
          config.resolve.fallback.net = false;
          config.resolve.fallback.tls = false;
          config.resolve.fallback.dns = false;
          config.resolve.fallback.child_process = false;
        }
        config.mode = 'development'
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
          config.resolve.fallback.dns = false;
          config.resolve.fallback.child_process = false;
        }
        config.mode = 'production'
        return config;
      },
      pwa: {
        runtimeCaching,
        maximumFileSizeToCacheInBytes: 10000000
      },
      output: 'standalone',
      experimental: {
        esmExternals: false,
        optimizeCss: true
      },
      poweredByHeader: false
    })
  }

}
