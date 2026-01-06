module.exports = function(api) {
  // Cache based on NODE_ENV
  api.cache.using(() => process.env.NODE_ENV);
  
  const isTest = api.env('test');
  
  if (isTest) {
    return {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react'
      ],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-object-rest-spread'
      ],
      // Ignore .babelrc when in test mode
      babelrc: false
    };
  }
  
  // For webpack build, return empty config to use .babelrc
  return {
    babelrc: true
  };
};
