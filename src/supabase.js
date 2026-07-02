import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkklfxxayuvtmqjhwogh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra2xmeHhheXV2dG1xamh3b2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTMwMjUsImV4cCI6MjA5ODIyOTAyNX0.6I54MWY-xHFYvNKnWYWnPjaafiGDQOIY4d8oHtQ0fZE'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Empreendimentos ───────────────────────────────────────────────
export const getEmpreendimentos = async () => {
  // Não traz a foto (base64 pesado) na listagem — só id, nome, cidade etc.
  const { data } = await supabase
    .from('empreendimentos')
    .select('id,nome,cidade,estado,pais,cert,nivel,foto,arquivado,created_at')
    .order('created_at', { ascending: true })
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

// ── Obras ─────────────────────────────────────────────────────────
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

// ── Registros — sem fotos/anexos na listagem (carrega sob demanda) ─
export const getRegistros = async (empId) => {
  const { data } = await supabase
    .from('registros')
    .select('id,serial,atividade,pavimento,junta,responsavel,horario,geo_lat,geo_lng,utm_zone,utm_e,utm_n,drive,coments,nfs,cats,x,y,empreendimento_id,created_at,updated_at')
    .eq('empreendimento_id', empId)
    .order('created_at', { ascending: false })
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

// ── Plantas — sem imagem na listagem, carrega sob demanda ─────────
export const getPlantasMeta = async (empId) => {
  // Busca só metadados (nome, pavimento, updated_at) — rápido
  const { data } = await supabase
    .from('plantas')
    .select('id,pavimento,nome_arquivo,updated_at,empreendimento_id')
    .eq('empreendimento_id', empId)
  if (!data) return {}
  return data.reduce((acc, row) => {
    acc[row.pavimento] = { nome: row.nome_arquivo, updated_at: row.updated_at, loaded: false }
    return acc
  }, {})
}
export const getPlantaImagem = async (empId, pavimento) => {
  // Carrega a imagem só quando necessário
  const { data } = await supabase
    .from('plantas')
    .select('imagem')
    .eq('empreendimento_id', empId)
    .eq('pavimento', pavimento)
    .maybeSingle()
  return data?.imagem || null
}
export const savePlanta = async (empId, pavimento, imagem, nome_arquivo) => {
  // Tenta update primeiro, se não existir faz insert
  const { data: existing } = await supabase.from('plantas').select('id').eq('empreendimento_id', empId).eq('pavimento', pavimento).maybeSingle()
  const payload = { empreendimento_id: empId, pavimento, imagem, nome_arquivo, updated_at: new Date().toISOString() }
  if (existing?.id) {
    const { error } = await supabase.from('plantas').update(payload).eq('id', existing.id)
    if (error) console.error('savePlanta update error:', error)
  } else {
    const { error } = await supabase.from('plantas').insert(payload)
    if (error) console.error('savePlanta insert error:', error)
  }
}
export const deletePlanta = async (empId, pavimento) => {
  await supabase.from('plantas').delete().eq('empreendimento_id', empId).eq('pavimento', pavimento)
}

// ── Atividades ────────────────────────────────────────────────────
export const getAtividades = async (empId) => {
  const { data } = await supabase.from('atividades').select('*').eq('empreendimento_id', empId).order('nome')
  return data || []
}
// Helper para converter formato do banco para formato do componente
export const mapAtividades = (data) => data.map(a => ({ name: a.nome || a.name, color: a.cor || a.color }))
export const saveAtividade = async (empId, nome, cor) => {
  const { data } = await supabase.from('atividades').upsert({ empreendimento_id: empId, nome, cor }, { onConflict: 'empreendimento_id,nome' }).select().single()
  return data
}
export const deleteAtividade = async (empId, nome) => {
  await supabase.from('atividades').delete().eq('empreendimento_id', empId).eq('nome', nome)
}

// ── Juntas ────────────────────────────────────────────────────────
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

// ── Serial ────────────────────────────────────────────────────────
export const getSerialCounter = async (empId) => {
  const { data } = await supabase.from('config').select('value').eq('key', `serial_${empId}`).maybeSingle()
  return data ? parseInt(data.value) : 0
}
export const setSerialCounter = async (empId, value) => {
  const key = `serial_${empId}`
  // Tenta update, se não existir faz insert
  const { data: ex } = await supabase.from('config').select('id').eq('key', key).maybeSingle()
  if (ex?.id) {
    await supabase.from('config').update({ value: String(value) }).eq('id', ex.id)
  } else {
    await supabase.from('config').insert({ key, value: String(value) })
  }
}

// ── Usuários ──────────────────────────────────────────────────────
export const getUsuarios = async () => {
  const { data } = await supabase.from('usuarios').select('id,nome,email,telefone,role,initials,projeto,created_at').order('nome')
  return data || []
}
export const loginUsuario = async (email, senha) => {
  const { data } = await supabase.from('usuarios').select('*').eq('email', email).eq('senha', senha).maybeSingle()
  return data || null
}
export const saveUsuario = async (usuario) => {
  const { id, _newSenha, ...rest } = usuario
  // Se tem nova senha, aplica
  const payload = _newSenha ? { ...rest, senha: _newSenha } : rest
  if (id) {
    const { data } = await supabase.from('usuarios').update(payload).eq('id', id).select().single()
    return data
  } else {
    const { data } = await supabase.from('usuarios').insert(payload).select().single()
    return data
  }
}

// ── Logs — fire and forget (não bloqueia UI) ──────────────────────
export const getLogs = async (empId) => {
  const { data } = await supabase
    .from('logs')
    .select('id,usuario,acao,detalhe,created_at')
    .eq('empreendimento_id', empId)
    .order('created_at', { ascending: false })
    .limit(200) // limita para não carregar histórico infinito
  return data || []
}
export const addLog = (empId, usuario, acao, detalhe = '') => {
  // Fire and forget — não usa await para não bloquear a UI
  supabase.from('logs').insert({
    empreendimento_id: empId, usuario, acao, detalhe,
    created_at: new Date().toISOString()
  }).then(() => {})
}
