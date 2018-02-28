var Vector = require('vec');
var BIC = require('./bic.js');
var AIC = require('./aic.js');

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

class KMeansOptimizer {
    constructor(max_k, tries, data, loss='bic', selector='elbow') {
        this.maxk = max_k;
        this.tries = tries;
        this.data = data;
        this.loss = loss;
        this.selector = selector;
        this.reset();
    }

    reset() {
        this.k = 2;
        this.t = 0;
        this.kmeans = [0, 0 /* sentinel to have kth as kmeans[k] */];
    }

    ended() {
        return this.k == this.maxk && this.t == this.tries;
    }

    step_try() {
        var ktry = (new KMeans(this.k, this.data, this.loss)).start();
        if (this.t == 0) {
            this.best_try = ktry;
        } else if (ktry.score > this.best_try.score) {
            this.best_try = ktry;
        }

        ++this.t;
    }

    step() {
        if (this.t == this.tries) {
            ++this.k;
            this.t = 0;
        }

        this.step_try();

        if (this.t == this.tries) {
            this.kmeans.push(this.best_try);
        }
    }

    progress() {
        return (this.k * this.tries + this.t) / ((this.maxk + 1) * this.tries) * 100;
    }

    getRes() {
        if (this.selector === 'best') {
            return this.kmeans.slice(2).reduce((best, km) =>
                    km.score > best.score ? km : best
            );
        } else {
            var best_k = 1;
            var best_d2 = 0;
            for (var k = 3; k < this.maxk; ++k) {
                var d2 = this.kmeans[k - 1].score + this.kmeans[k + 1].score
                    - 2 * this.kmeans[k].score;
                if (Math.abs(d2) > best_d2) {
                    best_k = k;
                    best_d2 = Math.abs(d2);
                }
            }
            best_k = Math.min(best_k, this.maxk);
            return this.kmeans[best_k];
        }
    }
}

exports.KMeansOptimizer = KMeansOptimizer;
