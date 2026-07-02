import { useState, useEffect, useRef } from 'react'
import {
  getObra, saveObra, getRegistros, getAtividades, getJuntas,
  saveRegistro, deleteRegistro, saveAtividade, deleteAtividade,
  saveJunta, deleteJunta, getPlantas, savePlanta, deletePlanta,
  getSerialCounter, setSerialCounter, getLogs, addLog
} from './supabase'
import DadosObra from './components/DadosObra'
import PlantaBaixa from './components/PlantaBaixa'
import GestaoRegistros from './components/GestaoRegistros'
import Vista3D from './components/Vista3D'
import TelaInicial from './components/TelaInicial'
import MemoriaComandos from './components/MemoriaComandos'

const GOLD='#68541F', BEIGE='#CDC9B8', JET='#1A1A18', JET2='#2C2C28', JET3='#3E3E38', WHITE='#FFFFFF'

const PAVIMENTOS_DEFAULT=[
  '4º Subsolo','3º Subsolo','2º Subsolo','1º Subsolo',
  'Pavimento Térreo','Mezanino',
  '1º Pavimento','2º Pavimento','3º Pavimento','4º Pavimento',
  '5º Pavimento','6º Pavimento','7º Pavimento','8º Pavimento',
  '9º Pavimento','10º Pavimento','11º Pavimento','12º Pavimento',
  '13º Pavimento','14º Pavimento','15º Pavimento','Cobertura',
]

// Serial por empreendimento
const _serialMap = {}

export function resetSerialForEmp(empId, onDone) {
  _serialMap[empId] = 0
  setSerialCounter(empId, 0).then(() => { if (onDone) onDone() })
}

export async function initSerial(empId, registros) {
  const fromDB = await getSerialCounter(empId)
  const fromRegs = registros.length
    ? Math.max(...registros.map(r => parseInt(r.serial?.replace('#','') || '0') || 0))
    : 0
  _serialMap[empId] = Math.max(fromDB, fromRegs)
}

export function nextSerial(empId) {
  if (!_serialMap[empId]) _serialMap[empId] = 0
  _serialMap[empId] += 1
  setSerialCounter(empId, _serialMap[empId])
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
  const [plantas, setPlantas] = useState({})
  const [pavAtivo, setPavAtivo] = useState('Pavimento Térreo')
  const [modal, setModal] = useState(null)
  const [iconClicked, setIconClicked] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState([])

  const empId = obraAberta?.id

  useEffect(() => {
    if (!authed || !obraAberta) return
    ;(async () => {
      setLoading(true)
      setPavimentos(PAVIMENTOS_DEFAULT)
      setPlantas({})
      setRegistros([])
      setAtividades([])
      setJuntas([])
      setLogs([])
      setTab(0)
      try {
        const [obraData, regsData, ativsData, juntasData, plantasData, logsData] = await Promise.all([
          getObra(empId), getRegistros(empId), getAtividades(empId),
          getJuntas(empId), getPlantas(empId), getLogs(empId)
        ])
        if (obraData) setObra(obraData)
        else setObra({ nome: obraAberta.nome, certificacao: obraAberta.cert||'EDGE', nivel_certificacao: obraAberta.nivel||'', versao_certificacao:'', empreendimento_id: empId })
        setRegistros(regsData)
        setAtividades(ativsData.map(a => ({ name: a.nome, color: a.cor })))
        setJuntas(juntasData.map(j => j.nome))
        setPlantas(plantasData)
        setLogs(logsData)
        await initSerial(empId, regsData)
      } catch(e) { console.error(e) }
      setLoading(false)
    })()
  }, [authed, obraAberta])

  const logAction = async (acao, detalhe='') => {
    await addLog(empId, currentUser?.nome || 'Sistema', acao, detalhe)
    setLogs(prev => [{ usuario: currentUser?.nome, acao, detalhe, created_at: new Date().toISOString() }, ...prev])
  }

  const handleSaveObra = async (novaObra) => {
    setSyncing(true)
    const saved = await saveObra({ ...novaObra, empreendimento_id: empId })
    if (saved) { setObra(saved); await logAction('Dados da obra atualizados') }
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
      await logAction(reg.id ? 'Registro editado' : 'Registro criado', `Serial: ${saved.serial} · ${saved.atividade||''}`)
    }
    setSyncing(false)
    return saved
  }

  const handleDeleteRegistro = async (id) => {
    const reg = registros.find(r => r.id === id)
    setSyncing(true)
    await deleteRegistro(id)
    setRegistros(prev => prev.filter(r => r.id !== id))
    await logAction('Registro excluído', `Serial: ${reg?.serial}`)
    setSyncing(false)
  }

  const handleSavePlanta = async (pavimento, imageData, nomeArquivo) => {
    setSyncing(true)
    await savePlanta(empId, pavimento, imageData, nomeArquivo)
    setPlantas(prev => ({ ...prev, [pavimento]: { data: imageData, nome: nomeArquivo, updated_at: new Date().toISOString() } }))
    await logAction('Planta carregada', `Pavimento: ${pavimento} · Arquivo: ${nomeArquivo}`)
    setSyncing(false)
  }

  const handleDeletePlanta = async (pavimento) => {
    await deletePlanta(empId, pavimento)
    setPlantas(prev => { const n = {...prev}; delete n[pavimento]; return n })
    await logAction('Pavimento excluído', `Pavimento: ${pavimento}`)
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
    resetSerialForEmp(empId, async () => {
      await logAction('Nº de série reiniciado')
    })
  }

  const TABS = ['Dados da Obra', 'Registros para Certificação', 'Gestão de Registros', 'Vista 3D', 'Memória de Comandos']

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
      <div style={{width:40,height:2,background:GOLD}}/>
    </div>
  )

  return (
    <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",background:'#F7F5F0',minHeight:'100vh',color:JET}}>
      <div style={{background:JET,color:'#fff',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${JET3}`,height:56,position:'sticky',top:0,zIndex:100}}>
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
          <div style={{fontSize:10,color:'#555',textAlign:'right'}}>
            {obra.nivel_certificacao && <div style={{color:GOLD}}>Nível: {obra.nivel_certificacao}</div>}
            {obra.versao_certificacao && <div>v{obra.versao_certificacao}</div>}
          </div>
        </div>
      </div>

      <div style={{display:'flex',background:JET2,borderBottom:`1px solid ${JET3}`,overflowX:'auto',position:'sticky',top:56,zIndex:99}}>
        {TABS.map((t,i) => (
          <button key={i} onClick={()=>setTab(i)} style={{padding:'12px 18px',border:'none',background:'transparent',color:tab===i?BEIGE:'#666',fontWeight:tab===i?700:400,fontSize:11,cursor:'pointer',letterSpacing:.8,textTransform:'uppercase',borderBottom:tab===i?`2px solid ${GOLD}`:'2px solid transparent',whiteSpace:'nowrap',transition:'all .2s'}}>{t}</button>
        ))}
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
            empId={empId}
          />
        )}
        {tab===2 && (
          <GestaoRegistros
            registros={registros} atividades={atividades}
            onDeleteRegistro={handleDeleteRegistro} onResetSerial={handleResetSerial}
          />
        )}
        {tab===3 && <Vista3D registros={registros} pavimentos={pavimentos} atividades={atividades}/>}
        {tab===4 && <MemoriaComandos logs={logs}/>}
      </div>
    </div>
  )
}
