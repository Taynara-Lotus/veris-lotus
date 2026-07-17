import { useState, useEffect } from 'react'
import {
  getObra, saveObra, getRegistros, getAtividades, mapAtividades, getJuntas, getUsuarios,
  saveRegistro, deleteRegistro, saveAtividade, deleteAtividade,
  saveJunta, deleteJunta, getPlantasMeta, getPlantaImagem,
  savePlanta, deletePlanta, getSerialCounter, setSerialCounter,
  getLogs, addLog
} from './supabase'
import DadosObra from './components/DadosObra'
import PlantaBaixa from './components/PlantaBaixa'
import GestaoRegistros from './components/GestaoRegistros'
import Vista3D from './components/Vista3D'
import TelaInicial from './components/TelaInicial'
import MemoriaComandos from './components/MemoriaComandos'

const GOLD='#B99A54', BEIGE='#e4dfd0', JET='#16140f', JET2='#1a1612', JET3='#2a2620', WHITE='#FFFFFF'

const PAVIMENTOS_DEFAULT=[
  '4º Subsolo','3º Subsolo','2º Subsolo','1º Subsolo',
  'Pavimento Térreo','Mezanino',
  '1º Pavimento','2º Pavimento','3º Pavimento','4º Pavimento',
  '5º Pavimento','6º Pavimento','7º Pavimento','8º Pavimento',
  '9º Pavimento','10º Pavimento','11º Pavimento','12º Pavimento',
  '13º Pavimento','14º Pavimento','15º Pavimento','Cobertura',
]

// Serial por empreendimento — cache local
const _serialMap = {}

export function resetSerialForEmp(empId, onDone) {
  _serialMap[empId] = 0
  setSerialCounter(empId, 0).then(() => { if (onDone) onDone() })
}

export async function initSerial(empId, registros) {
  const fromRegs = registros.length
    ? Math.max(...registros.map(r => parseInt(r.serial?.replace('#','') || '0') || 0))
    : 0
  const fromDB = await getSerialCounter(empId)
  // Usa o maior valor entre registros e banco para garantir continuidade
  _serialMap[empId] = Math.max(fromRegs, fromDB)
}

export function nextSerial(empId) {
  if (!_serialMap[empId]) _serialMap[empId] = 0
  _serialMap[empId] += 1
  setSerialCounter(empId, _serialMap[empId]) // fire and forget
  return '#' + String(_serialMap[empId]).padStart(6, '0')
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [obraAberta, setObraAberta] = useState(null)

  const [tab, setTab] = useState(0)
  const [obra, setObra] = useState({ nome:'', certificacao:'EDGE', nivel_certificacao:'', versao_certificacao:'' })
  const [registros, setRegistros] = useState([])
  const [atividades, setAtividades] = useState([])
  const [juntas, setJuntas] = useState([])
  const [pavimentos, setPavimentos] = useState(PAVIMENTOS_DEFAULT)
  // plantas = { pavimento: { data, nome, updated_at, loaded } }
  const [plantas, setPlantas] = useState({})
  const [pavAtivo, setPavAtivo] = useState('Pavimento Térreo')
  const [modal, setModal] = useState(null)
  const [iconClicked, setIconClicked] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [logsLoaded, setLogsLoaded] = useState(false)

  const empId = obraAberta?.id

  useEffect(() => {
    if (!authed || !obraAberta) return
    ;(async () => {
      setLoading(true)
      // Reset state
      setPavimentos(PAVIMENTOS_DEFAULT)
      setPlantas({})
      setRegistros([])
      setAtividades([])
      setJuntas([])
      setLogs([])
      setLogsLoaded(false)
      setUsuarios([])
      setTab(0) // sempre abre em Dados da Obra

      try {
        // Carrega dados essenciais em paralelo — plantas só traz metadados (rápido)
        const [obraData, regsData, ativsData, juntasData, plantasMeta] = await Promise.all([
          getObra(empId),
          getRegistros(empId),
          getAtividades(empId),
          getJuntas(empId),
          getPlantasMeta(empId),   // só nomes/datas, sem base64
        ])

        if (obraData) setObra(obraData)
        else setObra({ nome: obraAberta.nome, certificacao: obraAberta.cert||'EDGE', nivel_certificacao: obraAberta.nivel||'', versao_certificacao:'', empreendimento_id: empId })

        setRegistros(regsData)
        setAtividades(mapAtividades(ativsData))
        setJuntas(juntasData.map(j => j.nome))
        setPlantas(plantasMeta) // metadados apenas

        // Serial — usa registros locais, evita chamada extra ao banco
        await initSerial(empId, regsData)
        getUsuarios().then(u => setUsuarios(u))

      } catch(e) { console.error(e) }
      setLoading(false)
    })()
  }, [authed, obraAberta])

  // Carrega logs só quando o usuário abre a aba Memória de Comandos
  useEffect(() => {
    if (tab !== 4 || logsLoaded || !empId) return
    getLogs(empId).then(data => { setLogs(data); setLogsLoaded(true) })
  }, [tab, logsLoaded, empId])

  // Carrega imagem da planta só quando o usuário abre a aba Registros
  useEffect(() => {
    if (tab !== 1 || !empId) return
    // Para cada pavimento que tem metadado mas não tem imagem carregada
    Object.entries(plantas).forEach(([pav, info]) => {
      if (info.nome && !info.data && !info.loading) {
        setPlantas(prev => ({ ...prev, [pav]: { ...prev[pav], loading: true } }))
        getPlantaImagem(empId, pav).then(img => {
          if (img) setPlantas(prev => ({ ...prev, [pav]: { ...prev[pav], data: img, loading: false } }))
        })
      }
    })
  }, [tab, empId, plantas])

  const logAction = (acao, detalhe='') => {
    // Fire and forget — não bloqueia
    addLog(empId, currentUser?.nome || 'Sistema', acao, detalhe)
    setLogs(prev => [{ usuario: currentUser?.nome, acao, detalhe, created_at: new Date().toISOString() }, ...prev])
  }

  const handleSaveObra = async (novaObra) => {
    setSyncing(true)
    const saved = await saveObra({ ...novaObra, empreendimento_id: empId })
    if (saved) { setObra(saved); logAction('Dados da obra atualizados') }
    setSyncing(false)
  }

  const handleSaveRegistro = async (reg) => {
    setSyncing(true)
    const saved = await saveRegistro({ ...reg, empreendimento_id: empId })
    if (saved) {
      setRegistros(prev => {
        const idx = prev.findIndex(r => r.id === saved.id)
        return idx >= 0 ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev]
      })
      logAction(reg.id ? 'Registro editado' : 'Registro criado', `Serial: ${saved.serial} · ${saved.atividade||''}`)
    }
    setSyncing(false)
    return saved
  }

  const handleDeleteRegistro = async (id) => {
    const reg = registros.find(r => r.id === id)
    setSyncing(true)
    await deleteRegistro(id)
    setRegistros(prev => prev.filter(r => r.id !== id))
    logAction('Registro excluído', `Serial: ${reg?.serial}`)
    setSyncing(false)
  }

  const handleSavePlanta = async (pavimento, imageData, nomeArquivo) => {
    setSyncing(true)
    await savePlanta(empId, pavimento, imageData, nomeArquivo)
    setPlantas(prev => ({ ...prev, [pavimento]: { data: imageData, nome: nomeArquivo, updated_at: new Date().toISOString() } }))
    logAction('Planta carregada', `Pavimento: ${pavimento} · Arquivo: ${nomeArquivo}`)
    setSyncing(false)
  }

  const handleDeletePlanta = async (pavimento) => {
    await deletePlanta(empId, pavimento)
    setPlantas(prev => { const n = {...prev}; delete n[pavimento]; return n })
    logAction('Pavimento excluído', `Pavimento: ${pavimento}`)
  }

  const handleSaveAtividade = async (nome, cor) => {
    await saveAtividade(empId, nome, cor)
    setAtividades(prev => {
      const exists = prev.find(a => a.name === nome)
      return exists ? prev.map(a => a.name === nome ? { name: nome, color: cor } : a) : [...prev, { name: nome, color: cor }]
    })
  }
  const handleDeleteAtividade = async (nome) => {
    await deleteAtividade(empId, nome)
    setAtividades(prev => prev.filter(a => a.name !== nome))
  }
  const handleSaveJunta = async (nome) => {
    await saveJunta(empId, nome)
    setJuntas(prev => prev.includes(nome) ? prev : [...prev, nome])
  }
  const handleDeleteJunta = async (nome) => {
    await deleteJunta(empId, nome)
    setJuntas(prev => prev.filter(j => j !== nome))
  }

  const handleResetSerial = () => {
    if (registros.length > 0) {
      alert('Só é possível reiniciar a contagem quando não há registros no empreendimento.')
      return
    }
    resetSerialForEmp(empId, () => logAction('Nº de série reiniciado'))
  }

  const TABS = ['Dados da Obra', 'Registros', 'Gestão de Registros', 'Vista 3D', 'Memória de Comandos']

  if (!authed || !obraAberta) {
    return (
      <TelaInicial
        onLogin={(user) => { setAuthed(true); setCurrentUser(user) }}
        onSelectObra={(emp) => setObraAberta(emp)}
        authed={authed}
        currentUser={currentUser}
        onLogout={() => { setAuthed(false); setCurrentUser(null); setObraAberta(null) }}
        onUserUpdate={(u) => setCurrentUser(u)}
      />
    )
  }

  if (loading) return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:JET,gap:16}}>
      <div style={{fontFamily:"'Georgia',serif",fontSize:32,fontWeight:300,letterSpacing:'.2em',color:'#F7F5F0'}}>VĒ<span style={{color:GOLD}}>R</span>IS</div>
      <div style={{fontSize:12,color:BEIGE,letterSpacing:3,textTransform:'uppercase'}}>Carregando {obraAberta?.nome}...</div>
      <div style={{width:40,height:2,background:GOLD,animation:'none'}}/>
    </div>
  )

  return (
    <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",background:'#F7F5F0',minHeight:'100vh',color:JET}}>
      <div style={{background:JET,color:WHITE,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${JET3}`,height:56,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <button onClick={()=>setObraAberta(null)} style={{background:'none',border:'none',color:BEIGE,cursor:'pointer',fontSize:11,letterSpacing:.8,opacity:.7}}>← Empreendimentos</button>
          <div style={{width:1,height:28,background:JET3}}/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:BEIGE,letterSpacing:.8}}>{obraAberta?.nome}</div>
            <div style={{fontSize:10,color:'#666',letterSpacing:1,textTransform:'uppercase'}}>VĒRIS · Certification Platform</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {syncing && <div style={{fontSize:10,color:GOLD,letterSpacing:1}}>● sincronizando...</div>}
        </div>
      </div>

      {/* Tabs — pill style 4A */}
      <div style={{background:'#16140f',padding:'10px 20px',position:'sticky',top:56,zIndex:99,overflowX:'auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:999,padding:3,whiteSpace:'nowrap'}}>
          {TABS.map((t,i) => (
            <button key={i} onClick={()=>setTab(i)}
              style={{padding:'7px 12px',borderRadius:999,border:'none',
                background:tab===i?'#B99A54':'transparent',
                color:tab===i?'#16140f':'rgba(255,255,255,.45)',
                fontSize:9,letterSpacing:'.04em',cursor:'pointer',
                fontWeight:tab===i?700:400,
                fontFamily:'Inter,-apple-system,sans-serif',
                transition:'all .18s',whiteSpace:'nowrap'}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:20,maxWidth:1100,margin:'0 auto'}}>
        {tab===0 && <DadosObra obra={obra} setObra={setObra} onSave={handleSaveObra}/>}
        {tab===1 && (
          <PlantaBaixa
            plantas={plantas} setPlantas={setPlantas}
            onSavePlanta={handleSavePlanta} onDeletePlanta={handleDeletePlanta}
            pavimentos={pavimentos} setPavimentos={setPavimentos}
            pavAtivo={pavAtivo} setPavAtivo={setPavAtivo}
            registros={registros} modal={modal} setModal={setModal}
            iconClicked={iconClicked} setIconClicked={setIconClicked}
            juntas={juntas} atividades={atividades}
            onSaveRegistro={handleSaveRegistro} onDeleteRegistro={handleDeleteRegistro}
            onSaveAtividade={handleSaveAtividade} onDeleteAtividade={handleDeleteAtividade}
            onSaveJunta={handleSaveJunta} onDeleteJunta={handleDeleteJunta}
            empId={empId} usuarios={usuarios}
          />
        )}
        {tab===2 && <GestaoRegistros registros={registros} atividades={atividades} onDeleteRegistro={handleDeleteRegistro} onResetSerial={handleResetSerial}/>}
        {tab===3 && <Vista3D registros={registros} pavimentos={pavimentos} atividades={atividades}/>}
        {tab===4 && <MemoriaComandos logs={logs} currentUser={currentUser} onDeleteLogs={async (indices) => {
          const toDelete = indices.map(i => logs[i]).filter(Boolean)
          // Remove localmente
          setLogs(prev => prev.filter((_, i) => !indices.includes(i)))
        }}/>}
      </div>
    </div>
  )
}
