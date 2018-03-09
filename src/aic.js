var BIC = require('./bic.js');

class AIC {
    static compute(clusters, data, cs) {
        var ll = BIC._loglikelihood(clusters, data, cs);
        var dims = data[0].length;
        var freeParams = cs.length * (dims + 1);
        return -(2 * freeParams - 2 * ll);
    }
}

module.exports = AIC;
