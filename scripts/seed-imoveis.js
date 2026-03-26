#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DATA_DIR = path.join(__dirname, '../data')
const IMG_DIRS = ['ap-0001', 'ch-0001', 'ca-0001']
const BAIRROS = ['Moema', 'Vila Mariana', 'Jardins', 'Pinheiros', 'Vila Madalena', 'Consolação', 'Vila Olímpia', 'Itaim', 'Bela Vista', 'Centro']
const CIDADES = ['São Paulo', 'São Paulo', 'São Paulo', 'Guarulhos', 'Campinas']
const ESTADOS = ['SP', 'SP', 'SP', 'SP', 'SP']
const COMODIDADES_LISTA = ['Piscina', 'Academia', 'Quadra', 'Churrasqueira', 'Garagem', 'Elevador', 'Segurança', 'Área verde']
const NOMES = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Pedro Martins', 'Patricia Gomes']
const CONTATOS = [
  { nome: 'João Silva', tel: '11987654321', email: 'joao@imoveis.com' },
  { nome: 'Maria Santos', tel: '11987654322', email: 'maria@imoveis.com' },
  { nome: 'Carlos Oliveira', tel: '11987654323', email: 'carlos@imoveis.com' },
  { nome: 'Ana Costa', tel: '11987654324', email: 'ana@imoveis.com' },
]

// Schemas por categoria
const SCHEMAS = {
  apartamento: {
    quartos: [1, 2, 2, 2, 3, 3, 3, 4],
    banheiros: [1, 1, 2, 2, 2, 2, 3, 3],
    vagas: [1, 1, 1, 2, 2, 2, 2, 3],
    area: [50, 60, 75, 85, 100, 120, 150, 180],
    preco: [250000, 350000, 450000, 550000, 750000, 950000, 1200000, 1500000],
    tipo: ['alugar', 'venda', 'venda'],
    descricoes: [
      'Apartamento bem localizado com acabamento moderno',
      'Imóvel reformado próximo a comércios e transportes',
      'Unidade com varanda e vista privilegiada',
    ]
  },
  casa: {
    quartos: [2, 3, 3, 3, 4, 4, 4, 5],
    banheiros: [1, 2, 2, 2, 3, 3, 3, 4],
    vagas: [1, 2, 2, 2, 3, 3, 3, 4],
    area: [150, 200, 250, 300, 400, 500, 600, 800],
    preco: [500000, 700000, 900000, 1200000, 1500000, 2000000, 2500000, 3500000],
    tipo: ['venda', 'venda', 'venda'],
    descricoes: [
      'Casa ampla com quintal e piscina',
      'Residência bem estruturada em condomínio fechado',
      'Imóvel pronto para morar com acabamento completo',
    ]
  },
  kitnet: {
    quartos: [0, 0, 1],
    banheiros: [1, 1, 1],
    vagas: [0, 1, 1],
    area: [30, 40, 50],
    preco: [150000, 200000, 250000],
    tipo: ['alugar', 'alugar', 'venda'],
    descricoes: [
      'Kitnet compacta e aconchegante',
      'Unidade pronta para investimento',
    ]
  },
  terreno: {
    quartos: [0, 0, 0],
    banheiros: [0, 0, 0],
    vagas: [0, 0, 0],
    area: [500, 800, 1000, 1500, 2000],
    preco: [300000, 500000, 750000, 1000000, 1500000],
    tipo: ['venda', 'venda', 'venda'],
    descricoes: [
      'Terreno bem localizado para construção',
      'Área ampla com zoneamento comercial',
    ]
  },
  cobertura: {
    quartos: [3, 3, 4, 4, 4],
    banheiros: [2, 3, 3, 3, 4],
    vagas: [2, 2, 3, 3, 4],
    area: [200, 250, 300, 350, 400],
    preco: [1500000, 2000000, 2500000, 3000000, 4000000],
    tipo: ['venda', 'venda', 'venda'],
    descricoes: [
      'Cobertura duplex com terraço amplo',
      'Unidade com vista panorâmica da cidade',
    ]
  },
  comercial: {
    quartos: [0, 0, 1],
    banheiros: [1, 2, 2],
    vagas: [1, 2, 2],
    area: [80, 120, 200],
    preco: [500000, 800000, 1500000],
    tipo: ['alugar', 'venda', 'venda'],
    descricoes: [
      'Sala comercial em zona de alto fluxo',
      'Loja com vitrine ampla e acessibilidade',
    ]
  },
  chacara: {
    quartos: [2, 3, 3, 4],
    banheiros: [1, 2, 2, 3],
    vagas: [1, 2, 2, 2],
    area: [2000, 3000, 5000, 10000],
    preco: [800000, 1500000, 2500000, 5000000],
    tipo: ['venda', 'venda', 'venda'],
    descricoes: [
      'Chácara com vista privilegiada',
      'Propriedade com área verde extensa',
    ]
  },
  fazenda: {
    quartos: [3, 3, 4, 4],
    banheiros: [2, 2, 3, 3],
    vagas: [2, 2, 3, 3],
    area: [50000, 100000, 200000, 500000],
    preco: [5000000, 10000000, 20000000, 50000000],
    tipo: ['venda', 'venda', 'venda'],
    descricoes: [
      'Fazenda com infraestrutura completa',
      'Propriedade rural com ótimo potencial',
    ]
  }
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getCategories() {
  const catPath = path.join(DATA_DIR, 'meta/categorias.json')
  return JSON.parse(fs.readFileSync(catPath, 'utf-8'))
}

function getTitulos(cat) {
  const TITULOS = {
    apartamento: ['Apartamento 1 quarto', 'Apartamento 2 quartos', 'Apartamento 3 quartos', 'Apto com suite'],
    casa: ['Casa com piscina', 'Casa em condomínio', 'Casa reformada', 'Sobrado'],
    kitnet: ['Kitnet', 'Studio', 'Quitinete'],
    terreno: ['Terreno plano', 'Lote urbanizado', 'Área para construção'],
    cobertura: ['Cobertura duplex', 'Cobertura com terraço', 'Penthouse'],
    comercial: ['Sala comercial', 'Loja', 'Ponto comercial'],
    chacara: ['Chácara com piscina', 'Chácara de lazer', 'Casa de campo'],
    fazenda: ['Fazenda de grande área', 'Propriedade rural', 'Sítio'],
  }
  return TITULOS[cat] || ['Imóvel']
}

function gerarSlug(titulo, bairro, id) {
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  const baseParts = [normalize(titulo), normalize(bairro)].filter(Boolean).join('-')
  const idPart = id.replace('-', '')
  return `${baseParts}-${idPart}`
}

function gerarImovel(cat, id, prefixo, numero, idx) {
  const schema = SCHEMAS[cat.slug] || SCHEMAS.apartamento
  const titulo = random(getTitulos(cat.slug))
  const bairro = random(BAIRROS)
  const cidade = random(CIDADES)
  const estado = random(ESTADOS)
  const descricao = random(schema.descricoes)
  let tipo = random(schema.tipo)
  const quartos = random(schema.quartos)
  const banheiros = random(schema.banheiros)
  const vagas = random(schema.vagas)
  const area = random(schema.area)
  const preco = tipo === 'alugar' ? Math.floor(random(schema.preco) / 50) : random(schema.preco)
  const comodidades = []
  for (let i = 0; i < Math.random() * 4; i++) {
    comodidades.push(random(COMODIDADES_LISTA))
  }

  // Usa uma imagem aleatória por imóvel
  const imagesList = ['ap001.jpg', 'ap002.jpg', 'ap003.jpg', 'ap004.jpg', 'ap005.jpg', 'casa001.jpg', 'casa 002.jpeg', 'casa 003.webp']
  const imagem = imagesList[Math.floor(Math.random() * imagesList.length)]
  const fotos = []  // Fotos vazias

  const contato = random(CONTATOS)
  const slug = gerarSlug(titulo, bairro, id)

  // Garante distribuição: primeiros são destaque, depois venda, depois aluguel
  let destaque = false
  if (idx < 6) {
    destaque = true // primeiros 6 são destaque
    tipo = 'venda' // destaques são venda
  } else if (idx < 12) {
    tipo = 'venda' // próximos 6 são venda
  } else if (idx < 18) {
    tipo = 'alugar' // próximos 6 são aluguel
  }

  const now = new Date().toISOString()

  return {
    id,
    slug,
    titulo: `${titulo} em ${bairro}`,
    descricao,
    preco,
    tipo,
    cat: cat.slug,
    area,
    quartos,
    banheiros,
    vagas,
    img: id,
    imagem, // nome da imagem em /public/imagem/
    cidade,
    bairro,
    endereco: {
      rua: `Rua ${random(['das Flores', 'Principal', 'da Paz', 'dos Pinheiros', 'do Comércio'])}`,
      numero: String(Math.floor(Math.random() * 999) + 1),
      complemento: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 999) + 1}` : '',
      bairro,
      cidade,
      estado,
      cep: '0'.repeat(5) + Math.floor(Math.random() * 9999),
    },
    comodidades: [...new Set(comodidades)],
    fotos,
    contato,
    status: 'ativo',
    destaque,
    criadoEm: now,
    atualizadoEm: now,
  }
}

function gerarId(prefixo) {
  const num = Math.floor(Math.random() * 9999) + 1
  return `${prefixo}-${String(num).padStart(4, '0')}`
}

function salvarImovel(imovel) {
  const dir = path.join(DATA_DIR, `imoveis/${imovel.tipo}/${imovel.cat}`)
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, `${imovel.id}.json`)
  fs.writeFileSync(filePath, JSON.stringify(imovel, null, 2))
}

function atualizarLista(imoveis) {
  const listaPath = path.join(DATA_DIR, 'imoveis.json')
  const resumida = imoveis.map(i => ({
    id: i.id,
    slug: i.slug,
    titulo: i.titulo,
    preco: i.preco,
    tipo: i.tipo,
    cat: i.cat,
    img: i.id,
    cidade: i.cidade,
    bairro: i.bairro,
    quartos: i.quartos,
    banheiros: i.banheiros,
    vagas: i.vagas,
    area: i.area,
    destaque: i.destaque,
    comodidades: i.comodidades,
  }))

  const etag = crypto.createHash('md5').update(JSON.stringify(resumida)).digest('hex')

  fs.writeFileSync(
    listaPath,
    JSON.stringify(
      {
        etag,
        total: resumida.length,
        imoveis: resumida,
      },
      null,
      2
    )
  )
}

function main() {
  console.log('🌱 Iniciando seed de imóveis...\n')
  console.log('📸 Usando imagens dos 3 projetos iniciais')
  console.log('⭐ 6 Destaques + 6 Venda + 6 Aluguel = 18 imóveis principais\n')

  const categorias = getCategories()
  const imoveis = []
  let globalIdx = 0

  // Gera 6 destaques + 6 venda + 6 aluguel
  const totalPrincipal = 100
  const imoveisPerCat = Math.ceil(totalPrincipal / categorias.length)

  for (const cat of categorias) {
    console.log(`📦 ${cat.label}...`)

    for (let i = 0; i < imoveisPerCat && globalIdx < totalPrincipal; i++) {
      const id = gerarId(cat.prefixo)
      const imovel = gerarImovel(cat, id, cat.prefixo, i + 1, globalIdx)
      salvarImovel(imovel)
      imoveis.push(imovel)
      globalIdx++

      const tipo = imovel.destaque ? '⭐' : imovel.tipo === 'venda' ? '🔴' : '🟢'
      process.stdout.write(`   ${tipo} ${imovel.titulo.substring(0, 35)}...\n`)
    }
  }

  atualizarLista(imoveis)

  console.log(`\n✅ ${imoveis.length} imóveis gerados com sucesso!`)
  console.log(`⭐ Destaques: ${imoveis.filter(i => i.destaque).length}`)
  console.log(`🔴 Venda: ${imoveis.filter(i => i.tipo === 'venda').length}`)
  console.log(`🟢 Aluguel: ${imoveis.filter(i => i.tipo === 'alugar').length}`)
  console.log(`📄 Lista salva em data/imoveis.json`)
}

main()
