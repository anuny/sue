export default function string (val) {
  return val == null? '': typeof val === 'object'? JSON.stringify(val, null, 2): String(val)
}