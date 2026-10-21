// Masks bad words in user-written text using the `bad-words` package.
// English words come with the package; common Filipino ones are added below.
const Filter = require('bad-words');

const filter = new Filter({ placeHolder: '*' });
filter.addWords(
    'putangina', 'putang ina', 'tangina', 'tang ina', 'puta', 'gago', 'gaga',
    'tarantado', 'ulol', 'bobo', 'tanga', 'inutil', 'pakyu', 'bwisit', 'leche',
    'hayop ka', 'siraulo', 'shunga', 'pakshet', 'kupal'
);

// Returns { text, masked } where `text` has each bad word replaced by asterisks.
const maskBadWords = (value) => {
    const original = String(value ?? '');
    if (!original.trim()) return { text: original, masked: false };
    try {
        const text = filter.clean(original);
        return { text, masked: text !== original };
    } catch (err) {
        // bad-words can throw on odd strings (e.g. only punctuation) - keep the text as is
        return { text: original, masked: false };
    }
};

module.exports = { maskBadWords };
