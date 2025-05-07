const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        fs: false,
        crypto: false,
        stream: false,
        os: false,
        util: false,
        assert: false,
        constants: false,
        child_process: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        url: false,
        buffer: require.resolve('buffer/'),
        string_decoder: false,
        punycode: false,
        querystring: false,
        tty: false,
        timers: false,
        events: false,
        module: false
      };
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
          global: require.resolve('global'),
        }),
      ];
      return webpackConfig;
    },
  },
}; 