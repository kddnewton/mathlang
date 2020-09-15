export default {
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "awesome-typescript-loader" },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        exclude: /node_modules/
      }
    ]
  }
};
