import sharp from 'sharp'

export async function processarImagem(buffer: Buffer): Promise<{ full: Buffer; thumb: Buffer }> {
  const [full, thumb] = await Promise.all([
    sharp(buffer)
      .resize(1200, 1200, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .withMetadata({ exif: {} })
      .toBuffer(),
    sharp(buffer)
      .resize(400, 400, { fit: 'cover', position: 'centre' })
      .webp({ quality: 75 })
      .withMetadata({ exif: {} })
      .toBuffer(),
  ])
  return { full, thumb }
}
