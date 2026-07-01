import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkklfxxayuvtmqjhwogh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra2xmeHhheXV2dG1xamh3b2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTMwMjUsImV4cCI6MjA5ODIyOTAyNX0.6I54MWY-xHFYvNKnWYWnPjaafiGDQOIY4d8oHtQ0fZE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Obras ─────────────────────────────────────────────────────────
export const getObra = async () => {
  const { data, error } = await supabase.from('obras').select('*').limit(1).single()
  if (error && error.code !== 'PGRST116') console.error(error)
  return data
}

export const saveObra = async (obra) => {
  const { data: existing } = await supabase.from('obras').select('id').limit(1).single()
  if (existing) {
    const { data } = await supabase.from('obras').update(obra).eq('id', existing.id).select().single()
    return data
  } else {
    const { data } = await supabase.from('obras').insert(obra).select().single()
    return data
  }
}

// ── Registros ─────────────────────────────────────────────────────
export const getRegistros = async () => {
  const { data } = await supabase.from('registros').select('*').order('created_at', { ascending: false })
  return data || []
}

export const saveRegistro = async (registro) => {
  const { id, ...rest } = registro
  if (id) {
    const { data } = await supabase.from('registros').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    return data
  } else {
    const { data } = await supabase.from('registros').insert(rest).select().single()
    return data
  }
}

export const deleteRegistro = async (id) => {
  await supabase.from('registros').delete().eq('id', id)
}

// ── Plantas (persistência no Supabase) ───────────────────────────
// Salva a planta baixa (base64) de cada pavimento em uma tabela dedicada
export const getPlantas = async () => {
  const { data } = await supabase.from('plantas').select('*')
  if (!data) return {}
  // Retorna objeto { pavimento: { data, nome, updated_at } }
  return data.reduce((acc, row) => {
    acc[row.pavimento] = { data: row.imagem, nome: row.nome_arquivo, updated_at: row.updated_at }
    return acc
  }, {})
}

export const savePlanta = async (pavimento, imagem, nome_arquivo) => {
  const { data: existing } = await supabase.from('plantas').select('id').eq('pavimento', pavimento).maybeSingle()
  const payload = { pavimento, imagem, nome_arquivo, updated_at: new Date().toISOString() }
  if (existing) {
    await supabase.from('plantas').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('plantas').insert(payload)
  }
}

export const deletePlanta = async (pavimento) => {
  await supabase.from('plantas').delete().eq('pavimento', pavimento)
}

// ── Atividades ────────────────────────────────────────────────────
export const getAtividades = async () => {
  const { data } = await supabase.from('atividades').select('*').order('nome')
  return data || []
}

export const saveAtividade = async (nome, cor) => {
  const { data } = await supabase.from('atividades').upsert({ nome, cor }, { onConflict: 'nome' }).select().single()
  return data
}

export const deleteAtividade = async (nome) => {
  await supabase.from('atividades').delete().eq('nome', nome)
}

// ── Juntas ────────────────────────────────────────────────────────
export const getJuntas = async () => {
  const { data } = await supabase.from('juntas').select('*').order('nome')
  return data || []
}

export const saveJunta = async (nome) => {
  const { data } = await supabase.from('juntas').upsert({ nome }, { onConflict: 'nome' }).select().single()
  return data
}

export const deleteJunta = async (nome) => {
  await supabase.from('juntas').delete().eq('nome', nome)
}

// ── Config (serial counter) ───────────────────────────────────────
export const getSerialCounter = async () => {
  const { data } = await supabase.from('config').select('value').eq('key', 'serial_counter').maybeSingle()
  return data ? parseInt(data.value) : 0
}

export const setSerialCounter = async (value) => {
  const { data: existing } = await supabase.from('config').select('id').eq('key', 'serial_counter').maybeSingle()
  if (existing) {
    await supabase.from('config').update({ value: String(value) }).eq('key', 'serial_counter')
  } else {
    await supabase.from('config').insert({ key: 'serial_counter', value: String(value) })
  }
}
