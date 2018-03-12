const Vector = require('vec');
const { KMeans } = require('./kmeans.js');

class XMeans {
    constructor(data, mink, maxk, loss='aic', splitTries, guardMax=100) {
        this.data = data;
        this.clusters = (new Array(data.length)).fill(0);
        this.mink = mink;
        this.maxk = maxk;
        this.loss = loss;
        this.splitTries = splitTries || (data[0].length / 2);
        this.guardMax = guardMax;
        this.start();
    }

    static scoreParent(c, parentData, loss, guardMax) {
        let km1 = new KMeans([c], parentData, loss);
        return km1.start().score;
    }

    static scoreSplit(c, parentData, splitTries, loss, guardMax) {
        let maxDist = parentData.reduce((dist, d) => {
            return Math.max(dist, Vector.distance(d, c))
        }, 0);

        let best = null;
        for (let i = 0; i < splitTries; ++i) {
            let disp = Vector.randomUnit(c.length);

            let newC1 = c.slice();
            Vector.add(newC1, disp);

            let newC2 = c.slice();
            Vector.sub(newC2, disp);

            let km2 = new KMeans([newC1, newC2], parentData, loss, guardMax);
            let children;
            try {
                children = km2.start();
                if (!best || children.score > best.score) {
                    best = children;
                }
            } catch (e) {
            }
        }
        return best || {score: parseFloat('-Infinity')};
    }

    start() {
        let km = new KMeans(this.mink, this.data, this.loss, this.guardMax);
        let res = km.start();
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
        let centroids = this.centroids;
        let newCentroids = [];
        for (let cid = 0; cid < centroids.length; ++cid) {
            if (newCentroids.length > this.maxk) {
                break;
            }

            let itsData = this.data.filter((_, i) => {
                return this.prev.cluster[i] === cid;
            });

            if (itsData.length === 0) {
                continue;
            }

            let parentScore = XMeans.scoreParent(
                    centroids[cid], itsData, this.loss);
            let children = XMeans.scoreSplit(
                    centroids[cid], itsData, this.splitTries, this.loss);
            if (parentScore > children.score) {
                newCentroids.push(centroids[cid]);
                console.log('NO SPLIT');
            } else {
                newCentroids.push(children.centroids[0]);
                newCentroids.push(children.centroids[1]);
                console.log('SPLIT');
            }
        }

        let km = new KMeans(newCentroids, this.data, this.loss, this.guardMax);
        let res;
        try {
            res = km.start();
        } catch (e) {
            res = { score: parseFloat('-Infinity') };
        }
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
