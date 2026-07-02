import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkklfxxayuvtmqjhwogh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra2xmeHhheXV2dG1xamh3b2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTMwMjUsImV4cCI6MjA5ODIyOTAyNX0.6I54MWY-xHFYvNKnWYWnPjaafiGDQOIY4d8oHtQ0fZE'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Empreendimentos ───────────────────────────────────────────────
export const getEmpreendimentos = async () => {
  const { data } = await supabase.from('empreendimentos').select('*').order('created_at', { ascending: true })
  return data || []
}
export const saveEmpreendimento = async (emp) => {
  const { id, ...rest } = emp
  if (id) {
    const { data } = await supabase.from('empreendimentos').update(rest).eq('id', id).select().single()
    return data
  } else {
    const { data } = await supabase.from('empreendimentos').insert(rest).select().single()
    return data
  }
}
export const deleteEmpreendimento = async (id) => {
  await supabase.from('empreendimentos').delete().eq('id', id)
}

// ── Obras (por empreendimento) ────────────────────────────────────
export const getObra = async (empId) => {
  const { data } = await supabase.from('obras').select('*').eq('empreendimento_id', empId).maybeSingle()
  return data
}
export const saveObra = async (obra) => {
  const { id, ...rest } = obra
  if (id) {
    const { data } = await supabase.from('obras').update(rest).eq('id', id).select().single()
    return data
  } else {
    const { data } = await supabase.from('obras').insert(rest).select().single()
    return data
  }
}

// ── Registros (por empreendimento) ───────────────────────────────
export const getRegistros = async (empId) => {
  const { data } = await supabase.from('registros').select('*').eq('empreendimento_id', empId).order('created_at', { ascending: false })
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

// ── Plantas (por empreendimento) ──────────────────────────────────
export const getPlantas = async (empId) => {
  const { data } = await supabase.from('plantas').select('*').eq('empreendimento_id', empId)
  if (!data) return {}
  return data.reduce((acc, row) => {
    acc[row.pavimento] = { data: row.imagem, nome: row.nome_arquivo, updated_at: row.updated_at }
    return acc
  }, {})
}
export const savePlanta = async (empId, pavimento, imagem, nome_arquivo) => {
  const { data: existing } = await supabase.from('plantas').select('id').eq('empreendimento_id', empId).eq('pavimento', pavimento).maybeSingle()
  const payload = { empreendimento_id: empId, pavimento, imagem, nome_arquivo, updated_at: new Date().toISOString() }
  if (existing) {
    await supabase.from('plantas').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('plantas').insert(payload)
  }
}
export const deletePlanta = async (empId, pavimento) => {
  await supabase.from('plantas').delete().eq('empreendimento_id', empId).eq('pavimento', pavimento)
}

// ── Atividades (por empreendimento) ──────────────────────────────
export const getAtividades = async (empId) => {
  const { data } = await supabase.from('atividades').select('*').eq('empreendimento_id', empId).order('nome')
  return data || []
}
export const saveAtividade = async (empId, nome, cor) => {
  const { data } = await supabase.from('atividades').upsert({ empreendimento_id: empId, nome, cor }, { onConflict: 'empreendimento_id,nome' }).select().single()
  return data
}
export const deleteAtividade = async (empId, nome) => {
  await supabase.from('atividades').delete().eq('empreendimento_id', empId).eq('nome', nome)
}

// ── Juntas (por empreendimento) ───────────────────────────────────
export const getJuntas = async (empId) => {
  const { data } = await supabase.from('juntas').select('*').eq('empreendimento_id', empId).order('nome')
  return data || []
}
export const saveJunta = async (empId, nome) => {
  const { data } = await supabase.from('juntas').upsert({ empreendimento_id: empId, nome }, { onConflict: 'empreendimento_id,nome' }).select().single()
  return data
}
export const deleteJunta = async (empId, nome) => {
  await supabase.from('juntas').delete().eq('empreendimento_id', empId).eq('nome', nome)
}

// ── Serial (por empreendimento) ───────────────────────────────────
export const getSerialCounter = async (empId) => {
  const { data } = await supabase.from('config').select('value').eq('key', `serial_${empId}`).maybeSingle()
  return data ? parseInt(data.value) : 0
}
export const setSerialCounter = async (empId, value) => {
  const key = `serial_${empId}`
  const { data: existing } = await supabase.from('config').select('id').eq('key', key).maybeSingle()
  if (existing) {
    await supabase.from('config').update({ value: String(value) }).eq('key', key)
  } else {
    await supabase.from('config').insert({ key, value: String(value) })
  }
}

// ── Usuários ──────────────────────────────────────────────────────
export const getUsuarios = async () => {
  const { data } = await supabase.from('usuarios').select('*').order('nome')
  return data || []
}
export const saveUsuario = async (usuario) => {
  const { id, ...rest } = usuario
  if (id) {
    const { data } = await supabase.from('usuarios').update(rest).eq('id', id).select().single()
    return data
  } else {
    const { data } = await supabase.from('usuarios').insert(rest).select().single()
    return data
  }
}

// ── Log de Memória de Comandos ────────────────────────────────────
export const getLogs = async (empId) => {
  const { data } = await supabase.from('logs').select('*').eq('empreendimento_id', empId).order('created_at', { ascending: false })
  return data || []
}
export const addLog = async (empId, usuario, acao, detalhe = '') => {
  await supabase.from('logs').insert({
    empreendimento_id: empId,
    usuario,
    acao,
    detalhe,
    created_at: new Date().toISOString()
  })
}
