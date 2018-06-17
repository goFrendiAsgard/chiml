export function smartSplit(str: string, delimiter: string): string[] {
  if (str.indexOf(delimiter) === -1) {
    return [str];
  }
  let evenSingleQuoteCount = true;
  let evenDoubleQuoteCount = true;
  const data = [];
  let word = "";
  for (let i = 0; i < str.length; i++) {
    const chr = str[i];
    if (evenDoubleQuoteCount && evenSingleQuoteCount && str.substr(i, delimiter.length) === delimiter) {
      data.push(word.trim());
      i += delimiter.length - 1;
      word = "";
    } else {
      if (chr === "'") {
        evenSingleQuoteCount = !evenSingleQuoteCount;
      } else if (chr === '"') {
        evenDoubleQuoteCount = !evenDoubleQuoteCount;
      }
      word += chr;
    }
  }
  data.push(word.trim());
  return data;
}

export function isFlanked(str: string, openFlank: string, closeFlank: string): boolean {
  if (str.substr(0, openFlank.length) === openFlank &&
    str.substr(str.length - closeFlank.length, closeFlank.length) === closeFlank) {
    return true;
  }
  return false;
}

export function removeFlank(str: string, openFlank, closeFlank): string {
  if (isFlanked(str, openFlank, closeFlank)) {
    return str.substr(openFlank.length, str.length - openFlank.length - closeFlank.length);
  }
  return str;
}

export function doubleQuote(str: string): string {
  const newStr = str.replace(/"/g, "\\\"");
  return `"${newStr}"`;
}
