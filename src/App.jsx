import React, { useState, useEffect } from 'react'
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

// ── Design tokens (handoff 1B/4A) ────────────────────────────────
const GOLD='#B99A54', BEIGE='#e4dfd0', OFF='#faf8f3'
const JET='#16140f', JET2='#1A1A18', WHITE='#FFFFFF'
const MUTED='#736d5d', SUBTLE='#8a8477'
const PF = "'Playfair Display',Georgia,serif"
const IN = "Inter,-apple-system,sans-serif"

function useIsMobile() {
  const [mob, setMob] = React.useState(window.innerWidth < 768)
  React.useEffect(() => {
    const h = () => setMob(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return mob
}

const PAVIMENTOS_DEFAULT=[
  '4º Subsolo','3º Subsolo','2º Subsolo','1º Subsolo',
  'Pavimento Térreo','Mezanino',
  '1º Pavimento','2º Pavimento','3º Pavimento','4º Pavimento',
  '5º Pavimento','6º Pavimento','7º Pavimento','8º Pavimento',
  '9º Pavimento','10º Pavimento','11º Pavimento','12º Pavimento',
  '13º Pavimento','14º Pavimento','15º Pavimento','Cobertura',
]

const _serialMap = {}
export function resetSerialForEmp(empId, onDone) {
  _serialMap[empId] = 0
  setSerialCounter(empId, 0).then(() => { if (onDone) onDone() })
}
export async function initSerial(empId, registros) {
  const fromRegs = registros.length ? Math.max(...registros.map(r => parseInt(r.serial?.replace('#','') || '0') || 0)) : 0
  if (fromRegs > 0) { _serialMap[empId] = fromRegs; setSerialCounter(empId, fromRegs) }
  else { const fromDB = await getSerialCounter(empId); _serialMap[empId] = fromDB }
}
export function nextSerial(empId) {
  if (!_serialMap[empId]) _serialMap[empId] = 0
  _serialMap[empId] += 1
  setSerialCounter(empId, _serialMap[empId])
  return '#' + String(_serialMap[empId]).padStart(6, '0')
}

export default function App() {
  const isMobile = useIsMobile()
  const [authed, setAuthed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [obraAberta, setObraAberta] = useState(null)
  const [tab, setTab] = useState(0)
  const [obra, setObra] = useState({ nome:'', certificacao:'EDGE', nivel_certificacao:'', versao_certificacao:'' })
  const [registros, setRegistros] = useState([])
  const [atividades, setAtividades] = useState([])
  const [juntas, setJuntas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pavimentos, setPavimentos] = useState(PAVIMENTOS_DEFAULT)
  const [plantas, setPlantas] = useState({})
  const [pavAtivo, setPavAtivo] = useState('Pavimento Térreo')
  const [modal, setModal] = useState(null)
  const [iconClicked, setIconClicked] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoaded, setLogsLoaded] = useState(false)

  const empId = obraAberta?.id

  useEffect(() => {
    if (!authed || !obraAberta) return
    ;(async () => {
      setLoading(true)
      setPavimentos(PAVIMENTOS_DEFAULT); setPlantas({}); setRegistros([])
      setAtividades([]); setJuntas([]); setLogs([]); setLogsLoaded(false); setTab(0)
      try {
        const [obraData, ativsData, juntasData, usersData] = await Promise.all([
          getObra(empId), getAtividades(empId), getJuntas(empId), getUsuarios()
        ])
        if (obraData) setObra(obraData)
        else setObra({ nome: obraAberta.nome, certificacao: obraAberta.cert||'EDGE', nivel_certificacao: obraAberta.nivel||'', versao_certificacao:'', empreendimento_id: empId })
        setAtividades(mapAtividades(ativsData))
        setJuntas(juntasData.map(j => j.nome))
        setUsuarios(usersData)
        const [regsData, plantasMeta] = await Promise.all([getRegistros(empId), getPlantasMeta(empId)])
        setRegistros(regsData); setPlantas(plantasMeta)
        await initSerial(empId, regsData)
      } catch(e) { console.error(e) }
      setLoading(false)
    })()
  }, [authed, obraAberta])

  useEffect(() => {
    if (tab !== 4 || logsLoaded || !empId) return
    getLogs(empId).then(data => { setLogs(data); setLogsLoaded(true) })
  }, [tab, logsLoaded, empId])

  useEffect(() => {
    if (tab !== 1 || !empId) return
    Object.entries(plantas).forEach(([pav, info]) => {
      if (info.nome && !info.data && !info.loading) {
        setPlantas(prev => ({ ...prev, [pav]: { ...prev[pav], loading: true } }))
        getPlantaImagem(empId, pav).then(img => {
          if (img) setPlantas(prev => ({ ...prev, [pav]: { ...prev[pav], data: img, loading: false } }))
        })
      }
    })
  }, [tab, empId])

  const logAction = (acao, detalhe='') => {
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
      setRegistros(prev => { const i=prev.findIndex(r=>r.id===saved.id); return i>=0?prev.map(r=>r.id===saved.id?saved:r):[saved,...prev] })
      logAction(reg.id?'Registro editado':'Registro criado', `Serial: ${saved.serial} · ${saved.atividade||''}`)
    }
    setSyncing(false); return saved
  }
  const handleDeleteRegistro = async (id) => {
    const reg=registros.find(r=>r.id===id); setSyncing(true)
    await deleteRegistro(id); setRegistros(prev=>prev.filter(r=>r.id!==id))
    logAction('Registro excluído', `Serial: ${reg?.serial}`); setSyncing(false)
  }
  const handleSavePlanta = async (pavimento, imageData, nomeArquivo) => {
    setSyncing(true)
    await savePlanta(empId, pavimento, imageData, nomeArquivo)
    setPlantas(prev => ({ ...prev, [pavimento]: { data: imageData, nome: nomeArquivo, updated_at: new Date().toISOString() } }))
    logAction('Planta carregada', `Pavimento: ${pavimento}`); setSyncing(false)
  }
  const handleDeletePlanta = async (pavimento) => {
    await deletePlanta(empId, pavimento)
    setPlantas(prev => { const n={...prev}; delete n[pavimento]; return n })
    logAction('Pavimento excluído', `Pavimento: ${pavimento}`)
  }
  const handleSaveAtividade = async (nome, cor) => {
    await saveAtividade(empId, nome, cor)
    setAtividades(prev => { const e=prev.find(a=>a.name===nome); return e?prev.map(a=>a.name===nome?{name:nome,color:cor}:a):[...prev,{name:nome,color:cor}] })
  }
  const handleDeleteAtividade = async (nome) => { await deleteAtividade(empId, nome); setAtividades(prev=>prev.filter(a=>a.name!==nome)) }
  const handleSaveJunta = async (nome) => { await saveJunta(empId, nome); setJuntas(prev=>prev.includes(nome)?prev:[...prev,nome]) }
  const handleDeleteJunta = async (nome) => { await deleteJunta(empId, nome); setJuntas(prev=>prev.filter(j=>j!==nome)) }
  const handleResetSerial = () => {
    if (registros.length > 0) { alert('Só é possível reiniciar quando não há registros.'); return }
    resetSerialForEmp(empId, () => logAction('Nº de série reiniciado'))
  }

  const TABS = ['Dados da Obra', 'Registros', 'Gestão', 'Vista 3D', 'Memória']
  const TABS_FULL = ['Dados da Obra', 'Registros', 'Gestão de Registros', 'Vista 3D', 'Memória de Comandos']

  if (!authed || !obraAberta) {
    return (
      <TelaInicial
        onLogin={(user) => { setAuthed(true); setCurrentUser(user) }}
        onSelectObra={(emp) => setObraAberta(emp)}
        authed={authed} currentUser={currentUser}
        onLogout={() => { setAuthed(false); setCurrentUser(null); setObraAberta(null) }}
        onUserUpdate={(u) => setCurrentUser(u)}
      />
    )
  }

  if (loading) return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:JET,gap:16}}>
      <div style={{fontFamily:PF,fontSize:28,letterSpacing:'.2em',color:'#f2ede3'}}>VĒ<span style={{color:GOLD}}>R</span>IS</div>
      <div style={{fontSize:11,color:SUBTLE,letterSpacing:3,textTransform:'uppercase',fontFamily:IN}}>Carregando {obraAberta?.nome}...</div>
      <div style={{width:32,height:1.5,background:GOLD}}/>
    </div>
  )

  return (
    <div style={{fontFamily:IN,background:'#F7F5F0',minHeight:'100vh',color:JET}}>

      {/* HEADER — dark #16140f, VĒRIS tipográfico centralizado */}
      <div style={{background:JET,padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',height:52,position:'sticky',top:0,zIndex:100}}>
        <button onClick={()=>setObraAberta(null)} style={{background:'none',border:'none',color:SUBTLE,cursor:'pointer',fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',fontFamily:IN,padding:0}}>
          ← Empreendimentos
        </button>
        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{fontFamily:PF,fontSize:13,letterSpacing:'.22em',color:'#f2ede3'}}>VĒ<span style={{color:GOLD}}>R</span>IS</div>
          {!isMobile && <div style={{fontSize:8,color:SUBTLE,letterSpacing:'.1em',fontFamily:IN,marginTop:1,textTransform:'uppercase'}}>{obraAberta?.nome}</div>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {syncing && <div style={{width:5,height:5,borderRadius:'50%',background:GOLD,animation:'pulse 1s infinite'}}/>}
          <div style={{width:26,height:26,borderRadius:'50%',background:GOLD,color:JET,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:IN}}>
            {currentUser?.initials||'?'}
          </div>
        </div>
      </div>

      {/* Breadcrumb empreendimento */}
      {!isMobile && (
        <div style={{background:JET,padding:'0 20px 10px',display:'flex',flexDirection:'column',gap:2}}>
          <div style={{fontFamily:PF,fontSize:17,color:'#f2ede3',fontWeight:500}}>{obraAberta?.nome}</div>
        </div>
      )}

      {/* TABS — pill style (handoff tela 4) */}
      <div style={{background:JET,padding:isMobile?'8px 12px 10px':'6px 20px 10px',position:'sticky',top:52,zIndex:99,overflowX:'auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:0,background:'rgba(240,236,224,.08)',border:'1px solid rgba(228,223,208,.15)',borderRadius:999,padding:3,whiteSpace:'nowrap'}}>
          {TABS.map((t,i) => (
            <button key={i} onClick={()=>setTab(i)}
              style={{padding:isMobile?'6px 10px':'7px 13px',borderRadius:999,border:'none',
                background:tab===i?GOLD:'transparent',
                color:tab===i?JET:MUTED,
                fontSize:isMobile?8:9,letterSpacing:'.04em',cursor:'pointer',
                fontWeight:tab===i?700:400,fontFamily:IN,
                transition:'all .15s',whiteSpace:'nowrap'}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:isMobile?'14px 12px 80px':'20px 24px 80px',maxWidth:isMobile?'100%':1100,margin:'0 auto'}}>
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
            empId={empId} usuarios={usuarios} isMobile={isMobile}
          />
        )}
        {tab===2 && <GestaoRegistros registros={registros} atividades={atividades} onDeleteRegistro={handleDeleteRegistro} onResetSerial={handleResetSerial} isMobile={isMobile}/>}
        {tab===3 && <Vista3D registros={registros} pavimentos={pavimentos} atividades={atividades}/>}
        {tab===4 && <MemoriaComandos logs={logs} currentUser={currentUser} onDeleteLogs={async (indices) => { setLogs(prev => prev.filter((_,i) => !indices.includes(i))) }}/>}
      </div>
    </div>
  )
}
