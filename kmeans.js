var Vector = require('vec');

class KMeans {
    constructor(cs_or_k, data, loss='bic') {
        if (cs_or_k instanceof Array) {
            this.centroids = cs_or_k;
            this.k = cs_or_k.length;
        } else {
            this.k = cs_or_k;
            this.centroids = [];
            for (var i = 0; i < this.k; ++i) {
                this.centroids.push(data[Math.floor(Math.random() * data.length)]);
            }
        }
        this.data = data;
        this.loss = loss;
    }

    assignAll(clusters, points, cs) {
        var converged = true;
        for (var i = 0; i < points.length; ++i) {
            var newc = Vector.closest(points[i], cs);
            converged = converged && newc == clusters[i];
            clusters[i] = newc;
        }
        return converged;
    }

    countClusters(clusters, c) {
        var n = 0;
        for (var i = 0; i < clusters.length; ++i) {
            n += clusters[i] == c;
        }
        return n;
    }

    computeCentroids(clusters, points, cs) {
        var nb = cs.map((_, i) => this.countClusters(clusters, i));
        nb.forEach((n, i) => {
            if (n !== 0) {
                return;
            }
            var takeFrom = nb.findIndex(m => m > 1);
            var taken = clusters.findIndex(x => x === takeFrom);
            cs[i] = points[taken];
            clusters[taken] = i;
            --nb[takeFrom];
            ++nb[i];
        });

        for (var i = 0; i < cs.length; ++i) {
            cs[i] = Vector.zero(points[0].length);
        }
        for (var i = 0; i < points.length; ++i) {
            Vector.add(cs[clusters[i]], points[i]);
        }
        for (var i = 0; i < cs.length; ++i) {
            Vector.div(cs[i], this.countClusters(clusters, i));
        }
    }

    score(clusters, points, cs) {
        if (this.loss === 'bic') {
            return BIC.compute(clusters, points, cs);
        } else if (this.loss === 'aic') {
            return AIC.compute(clusters, points, cs);
        } else {
            var s = Vector.zero(cs.length);
            var count = Vector.zero(cs.length);
            for (var i = 0; i < points.length; ++i) {
                s[clusters[i]] += Vector.distance(points[i], cs[clusters[i]]);
                ++count[clusters[i]];
            }
            for (var i = 0; i < count.length; ++i) {
                s[i] /= count[i];
            }
            return -Vector.sum(s);
        }
    }

    start() {
        var data = this.data;
        var k = this.k;
        var kmeans = {};
        kmeans.k = k;
        kmeans.cluster = [];
        kmeans.centroids = this.centroids;
        for (var i = 0; i < data.length; ++i) {
            kmeans.cluster.push(0);
        }

        while (true) {
            if (this.assignAll(kmeans.cluster, data, kmeans.centroids)) {
                break;
            }
            this.computeCentroids(kmeans.cluster, data, kmeans.centroids);
        }
        kmeans.score = this.score(kmeans.cluster, data, kmeans.centroids);
        kmeans.closest = [];
        for (var i = 0; i < k; ++i) {
            kmeans.closest.push(Vector.closest(kmeans.centroids[i], data));
        }
        return kmeans;
    }

}

exports.KMeans = KMeans;
