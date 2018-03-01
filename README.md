# Demo

Live demo of `KMeansOptimizer` and `XMeans`
[here](https://vermeille.github.io/KMeans-demo/)!

# Installation

`npm install --save vermeille/kmeans`

# KMeans

A K-Means algorithm implementation.

```javascript
let { KMeans } = require('kmeans');

/*
 * First, construct the KMeans object.
 *
 * The first parameter is either `k`, the number of desired clusters, or an
 * `Array` of vectors (`Array`s): an initial position for each centroid.
 *
 * The second parameter is also an `Array` of vectors, representing all data
 * points.
 *
 * An optional third parameter allows to choose a loss function. Valid values
 * are: 'mse' (Mean Squared Error), 'bic' (default, Bayesian Information
 * Criterion), or 'aic' (Akaike Information Criterion).
 */
let km = new KMeans(4, data);

/*
 * Then do the calculations. It returns a result object containing:
 * - `k`: the number of clusters.
 * - `centroids`: an `Array` of vectors, all final and stable centroids.
 * - `cluster`: an `Array` of ints, `cluster[i]` being the cluster to which the
 *   `i`th data point has been affected.
 * - `closest`: an `Array` of ints, `closest[c]` being the index of the closest
 *   data point to `c`.
 * - `score`: the computed score / loss of the solution.
 */
let res = km.start();

// Just display our results
console.log(res);
```

# KMeansOptimizer

If the good amount of clusters `k` is unknown, we can search for it, by trying
several K-Means, from 1 to a maximal amount.

```javascript
let { KMeansOptimizer } = require('kmeans');

/*
 * First, construct a KMeansOptimizer object.
 *
 * The first parameter is `maxk`, the maximal amount of cluster we could
 * accept.
 *
 * The second parameter is the number of KMeans to run for each `k`. Since
 * KMeans is non deterministic by nature, we may want to try it several time
 * and keep the best.
 *
 * The third parameter is the data to fit.
 *
 * The fourth optional parameter is a loss function. 'mse', 'bic', or 'aic'.
 *
 * The fifth optional parameter is a selection method among different values of
 * `k`. 'best' chooses the best score, but that may overestimate the number of
 * clusters. 'elbow', as the name says, uses the elbow method to find the
 * number of clusters that achieve the best score before excessive refinement.
 * If you don't know what the elbow method is, just read about it on wikipedia.
 */
let kmo = new KMeansOptimizer(10, 30, data);

/*
 * Run the calculation. This may be very long. The API allows you to run it in
 * chunks so that you can do some cooperative scheduling with your browser, for
 * instance.
 *
 * `progress()` gives back an _indicative_ percentage of completion. This
 * number is not reliable in any way and is just intended to be displayed to
 * the users to keep them waiting.
 */
while (!kmo.ended()) {
    console.log(kmo.progress());
    kmo.step();
}

// Get the results of the best performing KMeans instance. Same result object
// as above.
let res = kmo.getRes();

// display the results
console.log(res);
```

# XMeans

X-Means is an improvement over K-Means, that tries to overcome K-Means' local
minimum issues and select a good K. It works by starting a K-Means with `minK`
centroids, and recursively trying to split each cluster, if that's worth it
(according to a criteria).

```javascript
let { XMeans } = require('kmeans');

/*
 * First, construct the XMeans object.
 *
 * The first parameter is the data to fit.

 * The second parameter is `mink`, a minimal number of clusters, used for
 * initialization.
 *
 * The third parameter is `maxk`, a maximal number of clusters.
 *
 * The fourth optional parameter is a loss function. 'mse', 'bic', or 'aic'.
 */
let km = new XMeans(data, 1, 10);

/*
 * Run the calculation. This may be very long. The API allows you to run it in
 * chunks so that you can do some cooperative scheduling with your browser, for
 * instance.
 *
 * `progress()` gives back an _indicative_ percentage of completion. This
 * number is not reliable in any way and is just intended to be displayed to
 * the users to keep them waiting.
 */
while (!kmo.ended()) {
    console.log(kmo.progress());
    kmo.step();
}

// Just display our results
console.log(res);
```
