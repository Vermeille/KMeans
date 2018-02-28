let km = require('./src/kmeans.js');
let xm = require('./src/xmeans.js');

module.exports = {
    KMeans: km.KMeans,
    KMeansOptimizer: km.KMeansOptimizer,
    XMeans: xm.XMeans
};
