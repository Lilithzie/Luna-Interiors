const Filter = require('bad-words');

const filter = new Filter({ placeHolder: '*' });
filter.addWords(
    'putangina', 'putang ina', 'tangina', 'tang ina', 'puta', 'gago', 'gaga',
    'tarantado', 'ulol', 'bobo', 'tanga', 'inutil', 'pakyu', 'bwisit', 'leche',
    'hayop ka', 'siraulo', 'shunga', 'pakshet', 'kupal'
);

// returns { text, masked }
const maskBadWords = (value) => {
    const original = String(value ?? '');
    if (!original.trim()) return { text: original, masked: false };
    try {
        const text = filter.clean(original);
        return { text, masked: text !== original };
    } catch (err) {
        // keep text if bad-words throws
        return { text: original, masked: false };
    }
};

module.exports = { maskBadWords };
