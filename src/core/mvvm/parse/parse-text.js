// 匹配默认的分隔符 "{}"
const tagRe = /\{((?:.|\n)+?)\}/g

export default function parseText(text) {
  if (!tagRe.test(text)) return;
  const tokens = [];
  let lastIndex = tagRe.lastIndex = 0;
  let index, matched;

  while (matched = tagRe.exec(text)) {
    index = matched.index;
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    tokens.push(matched[1].trim());
    lastIndex = index + matched[0].length;
  }
  if (lastIndex < text.length){
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  
  return tokens.join('+')
}