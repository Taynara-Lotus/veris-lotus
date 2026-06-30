import { useState, useEffect } from 'react'
import { getObra, getRegistros, getAtividades, getJuntas, saveRegistro, deleteRegistro, saveAtividade, deleteAtividade, saveJunta, deleteJunta } from './supabase'
import DadosObra from './components/DadosObra'
import PlantaBaixa from './components/PlantaBaixa'
import GestaoRegistros from './components/GestaoRegistros'
import Vista3D from './components/Vista3D'

const GOLD='#68541F',BEIGE='#CDC9B8',JET='#1A1A18',JET2='#2C2C28',JET3='#3E3E38',WHITE='#FFFFFF'

const PAVIMENTOS_DEFAULT=[
  '4º Subsolo','3º Subsolo','2º Subsolo','1º Subsolo',
  'Pavimento Térreo','Mezanino',
  '1º Pavimento','2º Pavimento','3º Pavimento','4º Pavimento',
  '5º Pavimento','6º Pavimento','7º Pavimento','8º Pavimento',
  '9º Pavimento','10º Pavimento','11º Pavimento','12º Pavimento',
  '13º Pavimento','14º Pavimento','15º Pavimento','Cobertura',
]

// ── Contador de serial global — resetável ─────────────────────────
let _serial = 0

export function resetSerialCounter() {
  _serial = 0
}

export function nextSerial(existing = []) {
  const nums = existing.map(r => parseInt(r.serial?.replace('#', '') || '0') || 0)
  const max = nums.length ? Math.max(...nums) : _serial
  _serial = max + 1
  return '#' + String(_serial).padStart(6, '0')
}

function LotusLogo({size=28,color=WHITE}){
  return(
    <svg height={size} width={size*3.6} viewBox="0 0 216 60" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      <text x="2" y="54" fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif" fontWeight="900" fontSize="60" fill={color} letterSpacing="-1">Lotus</text>
      <rect x="2" y="55" width="46" height="5" fill={color}/>
    </svg>
  )
}

export default function App(){
  const[tab,setTab]=useState(0)
  const[obra,setObra]=useState({nome:'Artefacto por Lotus',certificacao:'EDGE',nivel_certificacao:'',versao_certificacao:''})
  const[registros,setRegistros]=useState([])
  const[atividades,setAtividades]=useState([])
  const[juntas,setJuntas]=useState([])
  const[pavimentos,setPavimentos]=useState(PAVIMENTOS_DEFAULT)
  const[plantas,setPlantas]=useState({})
  const[pavAtivo,setPavAtivo]=useState('Pavimento Térreo')
  const[modal,setModal]=useState(null)
  const[iconClicked,setIconClicked]=useState(null)
  const[loading,setLoading]=useState(true)
  const[syncing,setSyncing]=useState(false)

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      try{
        const[obraData,regsData,ativsData,juntasData]=await Promise.all([
          getObra(),getRegistros(),getAtividades(),getJuntas()
        ])
        if(obraData) setObra(obraData)
        setRegistros(regsData)
        setAtividades(ativsData.map(a=>({name:a.nome,color:a.cor})))
        setJuntas(juntasData.map(j=>j.nome))
      }catch(e){console.error(e)}
      setLoading(false)
    })()
  },[])

  const handleSaveRegistro=async(reg)=>{
    setSyncing(true)
    const saved=await saveRegistro(reg)
    if(saved) setRegistros(prev=>{
      const idx=prev.findIndex(r=>r.id===saved.id)
      return idx>=0?prev.map(r=>r.id===saved.id?saved:r):[saved,...prev]
    })
    setSyncing(false)
    return saved
  }

  const handleDeleteRegistro=async(id)=>{
    setSyncing(true)
    await deleteRegistro(id)
    setRegistros(prev=>prev.filter(r=>r.id!==id))
    setSyncing(false)
  }

  const handleSaveAtividade=async(nome,cor)=>{
    await saveAtividade(nome,cor)
    setAtividades(prev=>{
      const exists=prev.find(a=>a.name===nome)
      return exists?prev.map(a=>a.name===nome?{name:nome,color:cor}:a):[...prev,{name:nome,color:cor}]
    })
  }

  const handleDeleteAtividade=async(nome)=>{
    await deleteAtividade(nome)
    setAtividades(prev=>prev.filter(a=>a.name!==nome))
  }

  const handleSaveJunta=async(nome)=>{
    await saveJunta(nome)
    setJuntas(prev=>prev.includes(nome)?prev:[...prev,nome])
  }

  const handleDeleteJunta=async(nome)=>{
    await deleteJunta(nome)
    setJuntas(prev=>prev.filter(j=>j!==nome))
  }

  // [FIX] Zerar contador de nº de série
  const handleResetSerial=()=>{
    resetSerialCounter()
  }

  const TABS=['Dados da Obra','Registros para Certificação','Gestão de Registros','Vista 3D']

  if(loading) return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:JET,gap:16}}>
      <LotusLogo size={40} color={WHITE}/>
      <div style={{fontSize:12,color:BEIGE,letterSpacing:3,textTransform:'uppercase'}}>Carregando VĒRIS...</div>
      <div style={{width:40,height:2,background:GOLD}}/>
    </div>
  )

  return(
    <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",background:'#F7F5F0',minHeight:'100vh',color:JET}}>
      <div style={{background:JET,color:WHITE,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${JET3}`,height:56,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <LotusLogo size={28} color={WHITE}/>
          <div style={{width:1,height:28,background:JET3}}/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:BEIGE,letterSpacing:.8}}>{obra.nome||'Artefacto'}</div>
            <div style={{fontSize:10,color:'#666',letterSpacing:1,textTransform:'uppercase'}}>VĒRIS · Certification Platform</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {syncing&&<div style={{fontSize:10,color:GOLD,letterSpacing:1}}>● sincronizando...</div>}
          <div style={{fontSize:10,color:'#555',textAlign:'right'}}>
            {obra.nivel_certificacao&&<div style={{color:GOLD}}>Nível: {obra.nivel_certificacao}</div>}
            {obra.versao_certificacao&&<div>v{obra.versao_certificacao}</div>}
          </div>
        </div>
      </div>

      <div style={{display:'flex',background:JET2,borderBottom:`1px solid ${JET3}`,overflowX:'auto',position:'sticky',top:56,zIndex:99}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{padding:'12px 22px',border:'none',background:'transparent',color:tab===i?BEIGE:'#666',fontWeight:tab===i?700:400,fontSize:11,cursor:'pointer',letterSpacing:.8,textTransform:'uppercase',borderBottom:tab===i?`2px solid ${GOLD}`:'2px solid transparent',whiteSpace:'nowrap',transition:'all .2s'}}>{t}</button>
        ))}
      </div>

      <div style={{padding:20,maxWidth:1100,margin:'0 auto'}}>
        {tab===0&&<DadosObra obra={obra} setObra={setObra}/>}
        {tab===1&&<PlantaBaixa
          plantas={plantas} setPlantas={setPlantas}
          pavimentos={pavimentos} setPavimentos={setPavimentos}
          pavAtivo={pavAtivo} setPavAtivo={setPavAtivo}
          registros={registros}
          modal={modal} setModal={setModal}
          iconClicked={iconClicked} setIconClicked={setIconClicked}
          juntas={juntas} atividades={atividades}
          onSaveRegistro={handleSaveRegistro}
          onDeleteRegistro={handleDeleteRegistro}
          onSaveAtividade={handleSaveAtividade}
          onDeleteAtividade={handleDeleteAtividade}
          onSaveJunta={handleSaveJunta}
          onDeleteJunta={handleDeleteJunta}
        />}
        {tab===2&&<GestaoRegistros
          registros={registros}
          atividades={atividades}
          onDeleteRegistro={handleDeleteRegistro}
          onResetSerial={handleResetSerial}
        />}
        {tab===3&&<Vista3D
          registros={registros}
          pavimentos={pavimentos}
          atividades={atividades}
        />}
      </div>
    </div>
  )
}
