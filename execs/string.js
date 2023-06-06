module.exports = function(input) {

    console.log('XXX', input)
    if (typeof input === 'string') {
        return input;
    } else {
        return 'erro';
    }
};
