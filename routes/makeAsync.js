const makeAsync = fn => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch (err) {
        return next(err);
    }
};

module.exports = makeAsync;
