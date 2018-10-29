export default function nextTick(cb, ctx) {
  let p = Promise.resolve()
  p.then(() => ctx? cb.call(ctx) : cb())
}