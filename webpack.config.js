const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");

module.exports = {
  ...defaultConfig,
  entry: {
    "components/multiple-step-form/index": path.resolve(
      process.cwd(),
      "src/components/multiple-step-form",
      "index.tsx"
    ),
    // Add more components here:
    // 'components/another-component/index': path.resolve(process.cwd(), 'src/components/another-component', 'index.tsx'),
  },
  output: {
    ...defaultConfig.output,
    path: path.resolve(process.cwd(), "build"),
  },
  resolve: {
    ...defaultConfig.resolve,
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  devServer: {
    ...defaultConfig.devServer,
    allowedHosts: "all",
  },
};
