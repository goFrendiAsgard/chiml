module.exports = (ctx, n1, n2) => {
    ctx.body = n1 - n2;
    return Promise.resolve(true);
};
