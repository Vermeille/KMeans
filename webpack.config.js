module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: ['./kmeans.js', './xmeans.js'],
  output: {
    filename: 'bundle.js'
  }
};
