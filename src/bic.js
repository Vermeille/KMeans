var Vector = require('vec');

class BIC {
    // Eq 18
    // https://github.com/bobhancock/goxmeans/blob/master/doc/BIC_notes.pdf
    // Based on
    // https://github.com/mynameisfiber/pyxmeans/blob/master/pyxmeans/xmeans.py
    static _variance(clusters, data, centroids) {
        var R = data.length;
        var K = centroids.length;
        var M = data[0].length;
        var s = data.reduce((tot, d, i) => {
                return tot + Vector.distance(d, centroids[clusters[i]]);
        }, 0);
        return s / (M * (R - K));
    }

    static _sizeOfCluster(clusters, i) {
        return clusters.reduce((tot, val) => val === i ? tot + 1 : tot, 0);
    }

    static _loglikelihood(clusters, data, centroids) {
        var R = data.length;
        var K = centroids.length;
        var M = data[0].length;
        var variance = BIC._variance(clusters, data, centroids);
        var t1 = 0;
        for (var i = 0; i < K; ++i) {
            var Rn = BIC._sizeOfCluster(clusters, i);
            t1 += Rn * Math.log(Rn);
        }
        var t2 = R * Math.log(R);
        var t3 = (R * M) / 2 * Math.log(2 * Math.PI * variance);
        var t4 = (M * (R - K)) / 2;
        return t1 - t2 - t3 - t4;
    }

    static compute(clusters, data, cs) {
        var dims = data[0].length;
        var freeParams = cs.length * (dims + 1);
        var R = data.length;
        var ll = BIC._loglikelihood(clusters, data, cs);
        return ll - freeParams / 2 * Math.log(R);
    }
}

exports.BIC = BIC;
