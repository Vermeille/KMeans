var Vector = require('vec');
var KMeans = require('./kmeans.js');

class XMeans {
    constructor(data, mink, maxk, loss='aic') {
        this.data = data;
        this.clusters = (new Array(data.length)).fill(0);
        this.mink = mink;
        this.maxk = maxk;
        this.loss = loss;
        this.start();
    }

    static scoreParent(c, parentData) {
        var km1 = new KMeans([c], parentData, this.loss);
        return km1.start().score;
    }

    static scoreSplit(c, parentData) {
        var maxDist = parentData.reduce((dist, d) => {
            return Math.max(dist, Vector.distance(d, c))
        }, 0);

        var best = null;
        for (var i = 0; i < 100; ++i) {
            var disp = Vector.randomUnit(c.length);

            var newC1 = c.slice();
            Vector.add(newC1, disp);

            var newC2 = c.slice();
            Vector.sub(newC2, disp);

            var km2 = new KMeans([newC1, newC2], parentData, this.loss);
            var children = km2.start();

            if (!best || children.score > best.score) {
                best = children;
            }
        }
        return best;
    }

    start() {
        var km = new KMeans(this.mink, this.data, this.loss);
        var res = km.start();
        this.centroids = res.centroids;
        this.k = this.mink;
        this.best = res;
        this.prev = res;
        this.done = false;
    }

    ended() {
        return this.done;
    }

    step() {
        var centroids = this.centroids;
        var newCentroids = [];
        for (var cid = 0; cid < centroids.length; ++cid) {
            if (newCentroids.length > this.maxk) {
                break;
            }

            var itsData = this.data.filter((_, i) => {
                return this.prev.cluster[i] === cid;
            });

            if (itsData.length === 0) {
                continue;
            }

            var parentScore = XMeans.scoreParent(centroids[cid], itsData);
            var children = XMeans.scoreSplit(centroids[cid], itsData);
            if (parentScore > children.score) {
                newCentroids.push(centroids[cid]);
                console.log('NO SPLIT');
            } else {
                newCentroids.push(children.centroids[0]);
                newCentroids.push(children.centroids[1]);
                console.log('SPLIT');
            }
        }

        var km = new KMeans(newCentroids, this.data, this.loss);
        var res = km.start();
        console.log(res.score);
        if (res.score > this.best.score) {
            this.best = res;
        }
        this.prev = res;
        this.done = this.centroids.length === res.centroids.length;
        this.centroids = res.centroids;
        this.k = centroids.length;
    }

    getRes() { return this.best; }
    progress() { return (this.k / this.maxk) * 100; }
}

exports.XMeans = XMeans;
