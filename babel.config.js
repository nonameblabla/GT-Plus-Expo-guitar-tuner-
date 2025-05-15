//babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],                         // підхоплює TSX, JSX, сучасний JS
  };
};
