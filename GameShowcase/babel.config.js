module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel", // ✅ in presets for v4
    ],
    plugins: [
      require.resolve("expo-router/babel"), // ✅ router still in plugins
    ],
  };
};