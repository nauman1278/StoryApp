function wrapText(text, maxChars) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (const word of words) {
        if ((currentLine + word).length > maxChars) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    return lines.join('\n');
}

console.log(wrapText("Once upon a time, a young boy named Leo lived in a small village surrounded by dark, quiet woods. The villagers believed the woods were full of shadows and never went inside. But Leo loved looking at the night sky, and he dreamed of finding something magical.", 45));
