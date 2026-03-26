'use client'
import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, X, Loader2, GripVertical } from 'lucide-react'

interface Props {
  imovelId: string
  fotos: string[]
  onChange: (fotos: string[]) => void
}

interface FotoState {
  index: string
  url: string
  uploading?: boolean
}

export function ImageUploader({ imovelId, fotos, onChange }: Props) {
  const [estados, setEstados] = useState<FotoState[]>(
    fotos.map(f => ({ index: f, url: `/img/${imovelId}/${f}.webp` }))
  )

  // Contador global para garantir índices únicos mesmo em uploads concorrentes
  const nextIdx = useRef(
    fotos.length > 0
      ? Math.max(...fotos.map(f => parseInt(f) || 0)) + 1
      : 0
  )

  // Drag reorder
  const dragFrom = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const index = String(nextIdx.current++)
      const tmpUrl = URL.createObjectURL(file)

      setEstados(prev => [...prev, { index, url: tmpUrl, uploading: true }])

      const form = new FormData()
      form.append('imovelId', imovelId)
      form.append('index', index)
      form.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
        const data = await res.json()
        setEstados(prev => {
          const novo = prev.map(e => e.index === index ? { ...e, url: data.path, uploading: false } : e)
          onChange(novo.filter(e => !e.uploading).map(e => e.index))
          return novo
        })
      } catch {
        setEstados(prev => prev.filter(e => e.index !== index))
      }
    }
  }, [imovelId, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  function remover(index: string) {
    setEstados(prev => {
      const novo = prev.filter(e => e.index !== index)
      onChange(novo.map(e => e.index))
      return novo
    })
  }

  function handleDragStart(i: number) {
    dragFrom.current = i
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    setDragOver(i)
  }

  function handleDropReorder(toIdx: number) {
    const fromIdx = dragFrom.current
    if (fromIdx === null || fromIdx === toIdx) {
      dragFrom.current = null
      setDragOver(null)
      return
    }
    setEstados(prev => {
      const novo = [...prev]
      const [removed] = novo.splice(fromIdx, 1)
      novo.splice(toIdx, 0, removed)
      onChange(novo.map(e => e.index))
      return novo
    })
    dragFrom.current = null
    setDragOver(null)
  }

  return (
    <div>
      {estados.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {estados.map((e, i) => (
            <div
              key={e.index}
              draggable={!e.uploading}
              onDragStart={() => handleDragStart(i)}
              onDragOver={ev => handleDragOver(ev, i)}
              onDrop={() => handleDropReorder(i)}
              onDragEnd={() => { dragFrom.current = null; setDragOver(null) }}
              className={`relative aspect-square rounded-lg overflow-hidden bg-[var(--color-bg-subtle)] border-2 transition-all duration-150 ${
                dragOver === i ? 'border-[var(--color-primary)] scale-105' : 'border-[var(--color-border)]'
              }`}
            >
              <Image src={e.url} alt="" fill className="object-cover" unoptimized />

              {/* Drag handle */}
              {!e.uploading && (
                <div className="absolute top-1 left-1 p-0.5 bg-black/50 rounded text-white/70 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3 h-3" />
                </div>
              )}

              {i === 0 && (
                <span className="absolute bottom-1 left-1 font-sans text-[10px] bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded">
                  Destaque
                </span>
              )}

              {e.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => remover(e.index)}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors duration-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 cursor-pointer ${
          isDragActive
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-6 h-6 text-[var(--color-text-faint)] mx-auto mb-2" />
        <p className="font-sans text-sm text-[var(--color-text-muted)]">
          {isDragActive ? 'Solte as imagens aqui' : 'Arraste imagens ou clique para selecionar'}
        </p>
        <p className="font-sans text-xs text-[var(--color-text-faint)] mt-1">
          Convertidas para WebP · Arraste as miniaturas para reordenar
        </p>
      </div>
    </div>
  )
}
