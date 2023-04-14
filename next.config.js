module.exports = {
  reactStrictMode: true,
  transpilePackages: [],
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    // Overcome Webpack referencing `window` in chunks
    config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`
    // Polyfill Worker for the browser
    config.resolve.fallback = {
      fs: false,
      worker_threads: false,
      Worker: false,
    }
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
      exclude: /node_modules/,
    });
    return config;
  },
}
