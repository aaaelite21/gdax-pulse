module.exports = function(date) {
    let coeff = 1000 * 60;
    return new Date(Math.round(date.getTime() / coeff) * coeff)
}