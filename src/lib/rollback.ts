import { storageGet, storagePut, storageDelete, purgeCache } from './storage'
import { gerarEtag } from './etag'
import { gerarSlug } from './slug'
import type { ImovelCompleto, ImovelResumo, ListaImoveis } from '@/types/imovel'

function imovelPath(imovel: ImovelCompleto): string {
  return `imoveis/${imovel.tipo}/${imovel.cat}/${imovel.id}.json`
}

function toResumo(imovel: ImovelCompleto): ImovelResumo {
  // Slug é imutável: se já existe, manter; senão gerar
  const slug = (imovel as any).slug || gerarSlug(imovel.titulo, imovel.endereco.bairro, imovel.id)

  return {
    id: imovel.id,
    slug,
    titulo: imovel.titulo,
    preco: imovel.preco,
    tipo: imovel.tipo,
    cat: imovel.cat,
    img: imovel.id,
    imagem: imovel.imagem as string || 'ap001.jpg', // imagem da pasta /public/imagem/
    cidade: imovel.endereco.cidade,
    bairro: imovel.endereco.bairro,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    vagas: imovel.vagas,
    area: imovel.area,
    destaque: false,
    comodidades: imovel.comodidades || [],
  }
}

async function atualizarLista(imovel: ImovelCompleto): Promise<void> {
  const raw = await storageGet('imoveis.json')
  const lista: ListaImoveis = raw ? JSON.parse(raw) : { etag: '', total: 0, imoveis: [] }

  const idx = lista.imoveis.findIndex(i => i.id === imovel.id)
  const resumo = toResumo(imovel)

  if (idx >= 0) {
    lista.imoveis[idx] = resumo
  } else {
    lista.imoveis.push(resumo)
    lista.total = lista.imoveis.length
  }

  const novo = JSON.stringify(lista)
  lista.etag = gerarEtag(novo)

  await storagePut('imoveis.json', JSON.stringify(lista, null, 2))
}

export async function salvarImovel(imovel: ImovelCompleto): Promise<void> {
  const filePath = imovelPath(imovel)

  // 1. lê versão atual para rollback em memória (não em arquivo)
  const atual = await storageGet(filePath)

  try {
    // 2. escreve novo
    const novoConteudo = JSON.stringify(imovel, null, 2)
    await storagePut(filePath, novoConteudo)

    // 3. valida lendo de volta
    const verificado = await storageGet(filePath)
    if (!verificado) throw new Error('Falha ao verificar arquivo salvo')
    const parsed: ImovelCompleto = JSON.parse(verificado)
    if (!parsed.id || !parsed.titulo) throw new Error('JSON do imóvel inválido')

    // 4. atualiza lista geral
    await atualizarLista(imovel)

    // 5. purge cache (no-op local)
    await purgeCache([filePath, 'imoveis.json'])

  } catch (err) {
    // rollback em memória: restaura o conteúdo anterior se existia
    if (atual) {
      try {
        await storagePut(filePath, atual)
      } catch {
        // se rollback falhar, apenas lança o erro original
      }
    }
    throw err
  }
}

export async function removerImovel(
  id: string,
  tipo: string,
  cat: string
): Promise<void> {
  const filePath = `imoveis/${tipo}/${cat}/${id}.json`

  await storageDelete(filePath)

  // remove da lista geral
  const raw = await storageGet('imoveis.json')
  if (!raw) return
  const lista: ListaImoveis = JSON.parse(raw)
  lista.imoveis = lista.imoveis.filter(i => i.id !== id)
  lista.total = lista.imoveis.length
  const novo = JSON.stringify(lista)
  lista.etag = gerarEtag(novo)
  await storagePut('imoveis.json', JSON.stringify(lista, null, 2))

  await purgeCache([filePath, 'imoveis.json'])
}

export async function toggleDestaque(id: string): Promise<void> {
  const raw = await storageGet('imoveis.json')
  if (!raw) return
  const lista: ListaImoveis = JSON.parse(raw)
  const idx = lista.imoveis.findIndex(i => i.id === id)
  if (idx < 0) return
  lista.imoveis[idx].destaque = !lista.imoveis[idx].destaque
  lista.etag = gerarEtag(JSON.stringify(lista))
  await storagePut('imoveis.json', JSON.stringify(lista, null, 2))
}
