import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkklfxxayuvtmqjhwogh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra2xmeHhheXV2dG1xamh3b2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTMwMjUsImV4cCI6MjA5ODIyOTAyNX0.6I54MWY-xHFYvNKnWYWnPjaafiGDQOIY4d8oHtQ0fZE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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
