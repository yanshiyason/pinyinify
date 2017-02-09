let pinyinDict = require("./pinyinDict");
let punctuation = new Set("！？，。：；’“”（）%~@#^&*");

// Cuts text according to words from the CC-CEDICT?
// https://www.mdbg.net/chindict/chindict.php?page=cc-cedict
function cut(text) {
    let matches = []
    let charArray = text.split('')
    let lastIndex = charArray.length - 1
    let longestWordCheck = 7
    outerLoop:
    for(let pointer = 0; pointer <= charArray.length; pointer++) {
        innerLoop:
        for(j = 0; j <= longestWordCheck; j++) {
            let word = charArray.slice(pointer, pointer + longestWordCheck - j).join('')
            let hit = pinyinDict[word]
            if(hit) {
                pointer += longestWordCheck - j - 1
                let match = {}
                match[word] = hit
                matches.push(match)
                continue outerLoop;
            }
        }
        // if not found in inner loop, just push current character to list.
        let word = charArray[pointer]
        if(!word) { continue }
        let match = {}
        match[word] = null
        matches.push(match)
    }
    return matches
}

function pinyinify(text) {
    let matches = cut(text);
    let out = []
    let last = matches.length
    matches.forEach((match, i) => {
        let key = firstKey(match)
        let word = match[key] || key
        let next = firstKey(matches[i+1])
        let nextIsWord = isWord(next)
        if (!nextIsWord || punctuation.has(word)) {
            out.push(word)    
            return
        }
        out.push(word, ' ')
    });
    newText = out.join('')
    return fixPunctuation(newText);
}

function firstKey(obj){
    if(!obj) { return null; }
    return Object.keys(obj)[0]
}

function isWord(char){
    if (!char)                 { return false; }
    if (punctuation.has(char)) { return false; }
    if (char === ' ')          { return false; }
    let isNumber = char.match(/[0-9]/g);
    if (isNumber) { return false; }
    return true;
}

function spacePunctuation(text) {
    return text.replace(/([!?,.:;'"%)]+)([^!?,.:;'"%)])/g, (x,p,n) => p + " " + n)
        .replace(/(?:([a-zA-Z])([0-9]))|(?:([0-9])([a-zA-Z]))/g, (x,p,n) => p + ' ' + n) // separates digits from leters
        .replace(/([^ ]{1})(`{2})/g, (x, p, n) => p + ' ' + n);                         // seperates `` from non white space chars
}

function fixPunctuation(text) {
    let replacements = {
        "！": "!",
        "？": "?",
        "。": ".",
        "，": ",",
        "：": ":",
        "；": ";",
        "‘": "`",
        "’": "'",
        "“": "``",
        "”": "\"",
        "（": "(",
        "）": ")"
    };

    let newText = text
    let keys = Object.keys(replacements)
    keys.forEach((key)=>{
        let re = new RegExp(key, 'g')
        newText = newText.replace(re, replacements[key])
    })
    return spacePunctuation(newText);
}

module.exports = pinyinify;