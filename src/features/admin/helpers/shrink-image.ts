const SIZE = 512

/**
 * A square, centre-cropped copy of the photo at most 512px wide, as WebP where the browser can encode it (PNG
 * otherwise). Re-encoding also drops the photo's metadata, GPS position included.
 */
export async function shrinkImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file) // turns phone photos upright from their EXIF orientation
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.min(SIZE, side)
  canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The photo could not be encoded'))), 'image/webp', 0.85),
  )
}
