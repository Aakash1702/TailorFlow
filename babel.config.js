module.exports = function (api) {
  api.cache.invalidate(() => `${process.env.SUPABASE_URL}-${process.env.SUPABASE_ANON_KEY}`);
  
  const plugins = [
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          "@": "./",
        },
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
      },
    ],
    "react-native-reanimated/plugin",
  ];
  
  if (process.env.NODE_ENV === 'production') {
    plugins.unshift(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }
  
  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
