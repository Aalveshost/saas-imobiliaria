/**
 * Gera slug SEO-friendly a partir de titulo + bairro + id
 * Exemplo: "Apartamento 3 quartos", "Moema", "ap-0001" → "apartamento-3-quartos-moema-ap0001"
 */
export function gerarSlug(titulo: string, bairro: string, id: string): string {
  // Remove acentos e caracteres especiais
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-') // substitui espaços/especiais por hífen
      .replace(/^-|-$/g, '') // remove hífens nas pontas

  const baseParts = [normalize(titulo), normalize(bairro)]
    .filter(Boolean)
    .join('-')

  // ID sem hífen (ap-0001 → ap0001)
  const idPart = id.replace('-', '')

  return `${baseParts}-${idPart}`
}

/**
 * Extrai o ID do slug
 * Exemplo: "apartamento-3-quartos-moema-ap0001" → "ap-0001"
 */
export function slugParaId(slug: string): string {
  // Procura por pattern: 2 letras + 4 dígitos no final
  const match = slug.match(/([a-z]{2})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}`
  }
  // Fallback: usar slug como id (compatibilidade com IDs antigos)
  return slug
}
