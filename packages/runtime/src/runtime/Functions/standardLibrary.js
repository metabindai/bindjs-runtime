let funcs = {}
funcs.capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
funcs.reverse = (s) => s.split('').reverse().join('')
funcs.contains = (s, substr) => s.includes(substr)
funcs.titleCase = (input) => {
    if (input == undefined) {
        return undefined
    }
    const smallWords = new Set([
        'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor',
        'of', 'on', 'or', 'the', 'to', 'up', 'yet'
    ])

    const words = input.trim().split(/\s+/)

    return words
        .map((word, i) => {
            const lower = word.toLowerCase()

            // Always capitalize first and last word
            if (i === 0 || i === words.length - 1) {
                return funcs.capitalize(word)
            }

            // Keep small words lowercase
            if (smallWords.has(lower)) {
                return lower
            }

            return funcs.capitalize(word)
        })
        .join(' ')
} 

export default funcs