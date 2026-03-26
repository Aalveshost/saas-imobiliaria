import { createHash } from 'crypto'

export function gerarEtag(content: string): string {
  return createHash('md5').update(content).digest('hex').slice(0, 16)
}
