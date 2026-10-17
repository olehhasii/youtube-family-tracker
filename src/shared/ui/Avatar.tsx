// A Member's photo, or their initial on a colour picked from their id so it never changes.
function hueOf(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

export function Avatar({ id, name, url, size = 40 }: { id: string; name: string; url: string | null; size?: number }) {
  const hue = hueOf(id)
  return url ? (
    <img src={url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(140deg, oklch(0.68 0.13 ${hue}), oklch(0.42 0.11 ${hue + 30}))`,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}
