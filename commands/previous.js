let previous;

module.exports = (current) => {
    if (previous) previous.remove();
    previous = current;
};
