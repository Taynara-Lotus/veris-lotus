import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkklfxxayuvtmqjhwogh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhra2xmeHhheXV2dG1xamh3b2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTMwMjUsImV4cCI6MjA5ODIyOTAyNX0.6I54MWY-xHFYvNKnWYWnPjaafiGDQOIY4d8oHtQ0fZE'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Sanitiza nome para Storage (remove caracteres inválidos) ────────
function sanitizePath(str) {
  return (str||'arquivo')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, '_')                // substitui especiais por _
    .replace(/_+/g, '_')                              // colapsa múltiplos _
    .substring(0, 80)                                 // limita tamanho
}

// ── Upload para Supabase Storage (resolve timeout de base64) ──────
async function uploadToStorage(base64, fileName, path) {
  try {
    const res = await fetch(base64)
    const blob = await res.blob()
    const { data, error } = await supabase.storage
      .from('arquivos-veris')
      .upload(path, blob, { upsert: true, contentType: blob.type })
    if (error) { console.error('Storage upload error:', error.message); return null }
    const { data: urlData } = supabase.storage.from('arquivos-veris').getPublicUrl(path)
    return urlData?.publicUrl || null
  } catch(e) { console.error('Storage exception:', e); return null }
}

// ── Empreendimentos ───────────────────────────────────────────────
export const getEmpreendimentos = async () => {
  const { data } = await supabase.from('empreendimentos')
    .select('id,nome,cidade,estado,pais,cert,nivel,foto,arquivado,created_at')
    .order('created_at', { ascending: true })
  return data || []
}
export const saveEmpreendimento = async (emp) => {
  const { id, ...rest } = emp
  
  // Se foto é base64, faz upload para Storage primeiro
  if (rest.foto && rest.foto.startsWith('data:')) {
    try {
      const res = await fetch(rest.foto)
      const blob = await res.blob()
      const ext = blob.type.includes('png') ? 'png' : 'jpg'
      const path = `capas/${id||Date.now()}_capa.${ext}`
      const { error } = await supabase.storage.from('arquivos-veris').upload(path, blob, { upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage.from('arquivos-veris').getPublicUrl(path)
        rest.foto = urlData?.publicUrl || rest.foto
      }
    } catch(e) { console.error('foto upload error:', e) }
  }
  
  if (id) {
    const { data } = await supabase.from('empreendimentos').update(rest).eq('id', id).select().single()
    return data
  }
  const { data } = await supabase.from('empreendimentos').insert(rest).select().single()
  return data
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
  }
  const { data } = await supabase.from('obras').insert(rest).select().single()
  return data
}

// ── Registros ─────────────────────────────────────────────────────
// Cache local para evitar re-fetch desnecessário
const _cache = { registros: {}, fotos: {}, arquivos: {} }

export const getRegistros = async (empId) => {
  const { data } = await supabase.from('registros')
    .select('id,serial,atividade,pavimento,junta,responsavel,horario,geo_lat,geo_lng,utm_zone,utm_e,utm_n,drive,coments,x,y,empreendimento_id,created_at,updated_at')
    .eq('empreendimento_id', empId)
    .order('created_at', { ascending: false })
  if (!data) return []

  // Carrega fotos e arquivos em paralelo (uma query cada)
  const [fotosRes, arquivosRes] = await Promise.all([
    supabase.from('fotos').select('registro_id,nome,url').eq('empreendimento_id', empId),
    supabase.from('arquivos').select('registro_id,tipo,nome,nome_arq,status,arquivo_url').eq('empreendimento_id', empId)
  ])

  const fotosMap = {}, nfsMap = {}, catsMap = {}
  ;(fotosRes.data||[]).forEach(f => {
    if (!fotosMap[f.registro_id]) fotosMap[f.registro_id] = []
    fotosMap[f.registro_id].push({ nome: f.nome, url: f.url })
  })
  ;(arquivosRes.data||[]).forEach(a => {
    const item = { nome: a.nome, nomeArq: a.nome_arq, status: a.status, arquivo_url: a.arquivo_url }
    if (a.tipo === 'nf') {
      if (!nfsMap[a.registro_id]) nfsMap[a.registro_id] = []
      nfsMap[a.registro_id].push(item)
    } else {
      if (!catsMap[a.registro_id]) catsMap[a.registro_id] = []
      catsMap[a.registro_id].push(item)
    }
  })

  const result = data.map(r => ({
    ...r,
    fotos: fotosMap[r.id] || [],
    nfs: nfsMap[r.id] || [],
    cats: catsMap[r.id] || []
  }))
  _cache.registros[empId] = result
  return result
}

// Busca registros do cache se disponível
export const getRegistrosCached = (empId) => _cache.registros[empId] || null
export const invalidateCache = (empId) => { delete _cache.registros[empId] }

export const saveRegistro = async (registro) => {
  const { id, fotos, nfs, cats, ...rest } = registro
  const empId = rest.empreendimento_id
  const payload = { ...rest }

  let savedData = null
  if (id) {
    const { data } = await supabase.from('registros')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    savedData = data
  } else {
    const { data } = await supabase.from('registros').insert(payload).select().single()
    savedData = data
  }

  if (!savedData) return null

  // Salva fotos em paralelo no Storage
  if (fotos !== undefined) {
    await supabase.from('fotos').delete().eq('registro_id', savedData.id)
    const fotosComUrl = await Promise.all((fotos||[]).map(async f => {
      let url = f.url || ''
      if (!url && f.data?.startsWith('data:')) {
        const path = `${empId}/${savedData.id}/fotos/${Date.now()}_${sanitizePath(f.nome||'foto')}`
        url = await uploadToStorage(f.data, f.nome, path) || ''
      }
      return { registro_id: savedData.id, empreendimento_id: empId, nome: f.nome, url }
    }))
    if (fotosComUrl.length > 0) await supabase.from('fotos').insert(fotosComUrl)
  }

  // Salva arquivos NFs e Cats no Storage
  if (nfs !== undefined || cats !== undefined) {
    await supabase.from('arquivos').delete().eq('registro_id', savedData.id)
    const allArqs = [
      ...(nfs||[]).map(n => ({ ...n, tipo: 'nf' })),
      ...(cats||[]).map(c => ({ ...c, tipo: 'cat' }))
    ]
    // Upload de todos os arquivos em paralelo
    const arqsComUrl = await Promise.all(allArqs.map(async arq => {
      let arquivo_url = arq.arquivo_url || ''
      if (!arquivo_url && arq.arquivo?.startsWith('data:')) {
        const path = `${empId}/${savedData.id}/${arq.tipo}/${Date.now()}_${sanitizePath(arq.nomeArq||'arquivo')}`
        arquivo_url = await uploadToStorage(arq.arquivo, arq.nomeArq, path) || ''
      }
      return { registro_id: savedData.id, empreendimento_id: empId, tipo: arq.tipo, nome: arq.nome||'', nome_arq: arq.nomeArq||'', status: arq.status||'pendente', arquivo_url }
    }))
    if (arqsComUrl.length > 0) {
      const { error } = await supabase.from('arquivos').insert(arqsComUrl)
      if (error) console.error('saveArquivos error:', error.message)
    }
  }

  return { ...savedData, fotos: fotos||[], nfs: nfs||[], cats: cats||[] }
}

export const deleteRegistro = async (id) => {
  await Promise.all([
    supabase.from('registros').delete().eq('id', id),
    supabase.from('fotos').delete().eq('registro_id', id),
    supabase.from('arquivos').delete().eq('registro_id', id),
  ])
}

// ── Plantas ───────────────────────────────────────────────────────
export const getPlantasMeta = async (empId) => {
  const { data } = await supabase.from('plantas')
    .select('id,pavimento,nome_arquivo,updated_at')
    .eq('empreendimento_id', empId)
  if (!data) return {}
  return data.reduce((acc, row) => {
    acc[row.pavimento] = { nome: row.nome_arquivo, updated_at: row.updated_at, loaded: false }
    return acc
  }, {})
}
export const getPlantaImagem = async (empId, pavimento) => {
  const { data } = await supabase.from('plantas')
    .select('imagem').eq('empreendimento_id', empId).eq('pavimento', pavimento).maybeSingle()
  return data?.imagem || null
}
export const savePlanta = async (empId, pavimento, imagem, nome_arquivo) => {
  const { data: existing } = await supabase.from('plantas').select('id')
    .eq('empreendimento_id', empId).eq('pavimento', pavimento).maybeSingle()
  const payload = { empreendimento_id: empId, pavimento, imagem, nome_arquivo, updated_at: new Date().toISOString() }
  if (existing?.id) {
    await supabase.from('plantas').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('plantas').insert(payload)
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
export const mapAtividades = (data) => data.map(a => ({ name: a.nome||a.name, color: a.cor||a.color }))
export const saveAtividade = async (empId, nome, cor) => {
  const { data: ex } = await supabase.from('atividades').select('id').eq('empreendimento_id', empId).eq('nome', nome).maybeSingle()
  if (ex?.id) {
    await supabase.from('atividades').update({ cor }).eq('id', ex.id)
  } else {
    const { error } = await supabase.from('atividades').insert({ empreendimento_id: empId, nome, cor })
    if (error && error.code !== '23505') console.error('saveAtividade error:', error.message)
  }
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
  const { data: ex } = await supabase.from('juntas').select('id').eq('empreendimento_id', empId).eq('nome', nome).maybeSingle()
  if (!ex?.id) {
    const { error } = await supabase.from('juntas').insert({ empreendimento_id: empId, nome })
    if (error && error.code !== '23505') console.error('saveJunta error:', error.message)
  }
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
  const { data: ex } = await supabase.from('config').select('id').eq('key', key).maybeSingle()
  if (ex?.id) {
    await supabase.from('config').update({ value: String(value) }).eq('id', ex.id)
  } else {
    await supabase.from('config').insert({ key, value: String(value) })
  }
}

// ── Usuários ──────────────────────────────────────────────────────
export const getUsuarios = async () => {
  const { data } = await supabase.from('usuarios')
    .select('id,nome,email,telefone,role,initials,projeto,created_at').order('nome')
  return data || []
}
export const loginUsuario = async (email, senha) => {
  const { data } = await supabase.from('usuarios').select('*')
    .eq('email', email).eq('senha', senha).maybeSingle()
  return data || null
}
export const saveUsuario = async (usuario) => {
  const { id, _newSenha, ...rest } = usuario
  const payload = _newSenha ? { ...rest, senha: _newSenha } : rest
  if (id) {
    const { data } = await supabase.from('usuarios').update(payload).eq('id', id).select().single()
    return data
  }
  const { data } = await supabase.from('usuarios').insert(payload).select().single()
  return data
}

// ── Logs ──────────────────────────────────────────────────────────
export const getLogs = async (empId) => {
  const { data } = await supabase.from('logs')
    .select('id,usuario,acao,detalhe,created_at')
    .eq('empreendimento_id', empId)
    .order('created_at', { ascending: false })
    .limit(200)
  return data || []
}
export const addLog = (empId, usuario, acao, detalhe = '') => {
  supabase.from('logs').insert({ empreendimento_id: empId, usuario, acao, detalhe, created_at: new Date().toISOString() }).then(() => {})
}
