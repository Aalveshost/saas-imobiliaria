export type TipoNegocio = 'alugar' | 'venda' | 'permuta'

export interface ImovelResumo {
  id: string
  slug: string
  titulo: string
  preco: number
  tipo: TipoNegocio
  cat: string
  img: string // id da imagem (src: /img/{id}/thumb.webp)
  imagem: string // nome da imagem em /public/imagem/
  cidade: string
  bairro: string
  quartos: number
  banheiros: number
  vagas: number
  area: number
  destaque: boolean
  comodidades: string[]
}

export interface ImovelCompleto extends ImovelResumo {
  descricao: string
  videoUrl?: string
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  comodidades: string[]
  fotos: string[] // ids das fotos (src: /img/{id}/{n}.webp)
  contato: {
    nome: string
    tel: string
    email: string
  }
  status: 'ativo' | 'inativo' | 'vendido'
  criadoEm: string
  atualizadoEm: string
  imagem: string // nome da imagem em /public/imagem/
}

export interface ListaImoveis {
  etag: string
  total: number
  imoveis: ImovelResumo[]
}

export interface Categoria {
  slug: string
  label: string
  prefixo: string
}

export interface Comodidade {
  slug: string
  label: string
}
