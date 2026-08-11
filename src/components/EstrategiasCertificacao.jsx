import { useState, useMemo } from 'react'
import { saveEstrategia, deleteEstrategia } from '../supabase'

const GOLD='#68541F',GOLD2='#8B6F2E',BEIGE='#CDC9B8',BEIGE2='#EDE8DF'
const JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'
const PF="'Playfair Display',Georgia,serif", IN="Inter,-apple-system,sans-serif"

const STATUS = [
  { value:'concluido',   label:'Concluído/Atendido',   color:'#8A9A5B' },
  { value:'consultoria', label:'Consultoria Validar',  color:'#C9A24B' },
  { value:'pendente',    label:'Pendente',              color:'#C17F68' },
  { value:'nao_aplica',  label:'Não Aplicável',         color:'#A39C8E' },
  { value:'andamento',   label:'Em Andamento',          color:'#6E8FA3' },
  { value:'nao_iniciado',label:'Não Iniciado',          color:'#8C7F6B' },
]
const statusInfo = v => STATUS.find(s=>s.value===v) || STATUS[5]

function fmt(d){ return d?new Date(d).toLocaleDateString('pt-BR'):'' }

function Badge({status}){
  const s=statusInfo(status)
  return <span style={{display:'inline-block',padding:'3px 10px',borderRadius:10,background:s.color+'1f',color:s.color,fontSize:10,fontWeight:700,letterSpacing:.4,border:`1px solid ${s.color}44`,whiteSpace:'nowrap'}}>{s.label}</span>
}

function Confirm({msg,onYes,onNo}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{background:WHITE,borderRadius:12,padding:28,maxWidth:340,width:'90%',boxShadow:'0 8px 40px rgba(0,0,0,.4)'}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12,fontFamily:IN}}>⚠️ Confirmar</div>
      <div style={{fontSize:13,color:'#555',marginBottom:22,fontFamily:IN}}>{msg}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button onClick={onNo} style={{background:'transparent',border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:IN}}>Cancelar</button>
        <button onClick={onYes} style={{background:'#C0392B',border:'1.5px solid #C0392B',color:WHITE,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:IN}}>Confirmar</button>
      </div>
    </div>
  </div>
}

function Inp({label,value,onChange,placeholder,as='input',list}){
  const Comp = as==='textarea' ? 'textarea' : 'input'
  return(
    <div style={{marginBottom:12}}>
      {label&&<label style={{fontSize:11,color:'#888',display:'block',marginBottom:4,letterSpacing:.5,textTransform:'uppercase',fontFamily:IN}}>{label}</label>}
      <Comp value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} list={list}
        rows={as==='textarea'?4:undefined}
        style={{width:'100%',boxSizing:'border-box',border:`1px solid ${BEIGE}`,borderRadius:6,padding:'8px 10px',fontSize:13,background:WHITE,outline:'none',fontFamily:IN,resize:as==='textarea'?'vertical':undefined}}/>
    </div>
  )
}

function EstrategiaModal({empId, item, categorias, usuarios, currentUser, onClose, onSaved}){
  const [form,setForm] = useState(item || { titulo:'', categoria:'', status:'nao_iniciado', descricao:'', comentarios:[], empreendimento_id:empId })
  const [saving,setSaving] = useState(false)
  const [novoComentario,setNovoComentario] = useState('')

  const upd=(k,v)=>setForm(f=>({...f,[k]:v}))

  const addComentario=()=>{
    if(!novoComentario.trim()) return
    const c={ data:new Date().toISOString().slice(0,10), usuario:currentUser?.nome||'Sistema', descricao:novoComentario.trim() }
    upd('comentarios', [...(form.comentarios||[]), c])
    setNovoComentario('')
  }
  const removeComentario=(i)=> upd('comentarios', (form.comentarios||[]).filter((_,j)=>j!==i))

  const handleSave=async()=>{
    if(!form.titulo.trim()){ alert('Informe o título da premissa.'); return }
    setSaving(true)
    const saved = await saveEstrategia({ ...form, empreendimento_id: empId })
    setSaving(false)
    if(saved){ onSaved(saved); onClose() }
  }

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:300,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 16px',overflowY:'auto'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:WHITE,borderRadius:12,padding:26,maxWidth:560,width:'100%',boxShadow:'0 8px 40px rgba(0,0,0,.4)'}}>
        <div style={{fontFamily:PF,fontSize:18,color:JET,marginBottom:18}}>{item?.id?'Editar Premissa':'Nova Premissa'}</div>

        <Inp label="Título" value={form.titulo} onChange={v=>upd('titulo',v)} placeholder="Ex: Comissionamento de sistemas HVAC"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label style={{fontSize:11,color:'#888',display:'block',marginBottom:4,letterSpacing:.5,textTransform:'uppercase',fontFamily:IN}}>Categoria</label>
            <input value={form.categoria||''} onChange={e=>upd('categoria',e.target.value)} list="categorias-lista" placeholder="Ex: Energia, Água, Resíduos..."
              style={{width:'100%',boxSizing:'border-box',border:`1px solid ${BEIGE}`,borderRadius:6,padding:'8px 10px',fontSize:13,background:WHITE,outline:'none',fontFamily:IN,marginBottom:12}}/>
            <datalist id="categorias-lista">{categorias.map(c=><option key={c} value={c}/>)}</datalist>
          </div>
          <div>
            <label style={{fontSize:11,color:'#888',display:'block',marginBottom:4,letterSpacing:.5,textTransform:'uppercase',fontFamily:IN}}>Status</label>
            <select value={form.status} onChange={e=>upd('status',e.target.value)}
              style={{width:'100%',boxSizing:'border-box',border:`1px solid ${BEIGE}`,borderRadius:6,padding:'8px 10px',fontSize:13,background:WHITE,outline:'none',fontFamily:IN,marginBottom:12}}>
              {STATUS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <Inp label="Descrição" as="textarea" value={form.descricao} onChange={v=>upd('descricao',v)} placeholder="Detalhe a premissa, requisito ou estratégia adotada..."/>

        <div style={{marginTop:6,marginBottom:6}}>
          <label style={{fontSize:11,color:'#888',display:'block',marginBottom:6,letterSpacing:.5,textTransform:'uppercase',fontFamily:IN}}>Comentários ({(form.comentarios||[]).length})</label>
          {(form.comentarios||[]).map((c,i)=>(
            <div key={i} style={{background:OFF,borderRadius:6,padding:'8px 10px',marginBottom:6,fontSize:12,position:'relative'}}>
              <button onClick={()=>removeComentario(i)} style={{position:'absolute',top:6,right:6,background:'none',border:'none',color:'#C0392B',cursor:'pointer',fontSize:12}}>✕</button>
              <div style={{display:'flex',gap:8,color:'#888',fontSize:10.5,marginBottom:3}}>
                <span style={{fontWeight:600,color:'#555'}}>👤 {c.usuario}</span><span>{fmt(c.data)}</span>
              </div>
              <div style={{color:JET,lineHeight:1.4}}>{c.descricao}</div>
            </div>
          ))}
          <div style={{display:'flex',gap:8}}>
            <input value={novoComentario} onChange={e=>setNovoComentario(e.target.value)} placeholder="Adicionar comentário..."
              onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addComentario() } }}
              style={{flex:1,border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 10px',fontSize:12,outline:'none',fontFamily:IN}}/>
            <button onClick={addComentario} style={{background:JET,color:'#faf8f3',border:'none',borderRadius:6,padding:'7px 14px',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:IN}}>+ Add</button>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',marginTop:20}}>
          {item?.id
            ? <button onClick={async()=>{ if(confirm('Excluir esta premissa?')){ await deleteEstrategia(item.id); onSaved(null,item.id); onClose() } }}
                style={{background:'transparent',border:'1.5px solid #C0392B',color:'#C0392B',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:IN}}>🗑️ Excluir</button>
            : <span/>}
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{background:'transparent',border:`1.5px solid ${BEIGE}`,color:'#666',borderRadius:6,padding:'8px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:IN}}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{background:GOLD,border:'none',color:WHITE,borderRadius:6,padding:'8px 18px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:IN,opacity:saving?.6:1}}>{saving?'Salvando...':'Salvar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EstrategiasCertificacao({empId, estrategias, setEstrategias, obra, usuarios, currentUser, isMobile=false}){
  const [modal,setModal] = useState(null) // 'new' | estrategia obj | null
  const [confirmDel,setConfirmDel] = useState(null)
  const [filtroStatus,setFiltroStatus] = useState('todos')
  const [filtroCategoria,setFiltroCategoria] = useState('todas')
  const [open,setOpen] = useState(null)
  const [search,setSearch] = useState('')

  const categorias = useMemo(()=>[...new Set(estrategias.map(e=>e.categoria).filter(Boolean))].sort(), [estrategias])

  const handleSaved = (saved, deletedId) => {
    if(deletedId){ setEstrategias(prev=>prev.filter(e=>e.id!==deletedId)); return }
    setEstrategias(prev => { const i=prev.findIndex(e=>e.id===saved.id); return i>=0 ? prev.map(e=>e.id===saved.id?saved:e) : [...prev, saved] })
  }

  const filtered = estrategias.filter(e => {
    if(filtroStatus!=='todos' && e.status!==filtroStatus) return false
    if(filtroCategoria!=='todas' && e.categoria!==filtroCategoria) return false
    const q=search.toLowerCase()
    if(q && !(e.titulo?.toLowerCase().includes(q) || e.descricao?.toLowerCase().includes(q))) return false
    return true
  })

  const grouped = useMemo(()=>{
    const map = {}
    filtered.forEach(e => { const cat = e.categoria || 'Sem categoria'; if(!map[cat]) map[cat]=[]; map[cat].push(e) })
    return map
  }, [filtered])

  const counts = STATUS.map(s => ({ ...s, n: estrategias.filter(e=>e.status===s.value).length }))

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <h2 style={{color:JET,margin:0,fontWeight:500,fontFamily:PF,fontSize:isMobile?16:18}}>Estratégias de Certificação</h2>
        <button onClick={()=>setModal('new')}
          style={{background:JET,border:'none',color:'#faf8f3',borderRadius:4,padding:'8px 16px',fontSize:9,fontWeight:600,cursor:'pointer',letterSpacing:'.12em',textTransform:'uppercase',fontFamily:IN}}>
          + Nova Premissa
        </button>
      </div>

      {/* Resumo por status */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {counts.map(s=>(
          <button key={s.value} onClick={()=>setFiltroStatus(filtroStatus===s.value?'todos':s.value)}
            style={{fontSize:10.5,fontWeight:700,padding:'5px 12px',borderRadius:12,cursor:'pointer',
              background:filtroStatus===s.value ? s.color : s.color+'1a',
              color:filtroStatus===s.value ? WHITE : s.color,
              border:`1px solid ${s.color}55`,fontFamily:IN}}>
            {s.label}: {s.n}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:18}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar premissa..."
          style={{border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 12px',fontSize:13,outline:'none',width:200,fontFamily:IN}}/>
        <select value={filtroCategoria} onChange={e=>setFiltroCategoria(e.target.value)}
          style={{border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 10px',fontSize:12,outline:'none',fontFamily:IN}}>
          <option value="todas">Todas as categorias</option>
          {categorias.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length===0 && (
        <div style={{textAlign:'center',padding:60,color:'#BBB',fontSize:14,fontFamily:IN}}>
          {estrategias.length===0 ? 'Nenhuma premissa cadastrada ainda.' : 'Nenhum resultado encontrado.'}
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{marginBottom:22}}>
          <div style={{fontSize:11,color:GOLD2,letterSpacing:1,textTransform:'uppercase',fontWeight:700,marginBottom:8,fontFamily:IN}}>{cat} ({items.length})</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {items.map(e => {
              const isOpen = open===e.id
              return (
                <div key={e.id} style={{border:`1px solid ${BEIGE2}`,borderRadius:8,overflow:'hidden',background:WHITE,boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)'}}>
                  <div onClick={()=>setOpen(isOpen?null:e.id)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'11px 16px',cursor:'pointer',background:isOpen?OFF:WHITE}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:isMobile?12:13,color:JET,fontWeight:600,fontFamily:IN,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.titulo}</div>
                    </div>
                    <Badge status={e.status}/>
                    <span style={{fontSize:10,color:'#ccc'}}>{isOpen?'▲':'▼'}</span>
                  </div>
                  {isOpen && (
                    <div style={{padding:'14px 16px',borderTop:`1px solid ${BEIGE2}`,background:'#FEFEFE'}}>
                      {e.descricao && <div style={{fontSize:13,color:JET,lineHeight:1.5,marginBottom:12,whiteSpace:'pre-wrap'}}>{e.descricao}</div>}
                      {e.comentarios?.length>0 && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:6,fontFamily:IN}}>Comentários ({e.comentarios.length})</div>
                          {e.comentarios.map((c,i)=>(
                            <div key={i} style={{background:OFF,borderRadius:6,padding:'8px 10px',marginBottom:6,fontSize:12}}>
                              <div style={{display:'flex',gap:8,color:'#888',fontSize:10.5,marginBottom:3}}>
                                <span style={{fontWeight:600,color:'#555'}}>👤 {c.usuario}</span><span>{fmt(c.data)}</span>
                              </div>
                              <div style={{color:JET,lineHeight:1.4}}>{c.descricao}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                        <button onClick={()=>setModal(e)} style={{background:'transparent',border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:IN}}>✎ Editar</button>
                        <button onClick={()=>setConfirmDel(e.id)} style={{background:'#C0392B',border:'none',color:WHITE,borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:IN}}>🗑️ Excluir</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {modal && (
        <EstrategiaModal
          empId={empId}
          item={modal==='new'?null:modal}
          categorias={categorias}
          usuarios={usuarios}
          currentUser={currentUser}
          onClose={()=>setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {confirmDel && (
        <Confirm
          msg="Deseja realmente excluir esta premissa?"
          onYes={async()=>{ await deleteEstrategia(confirmDel); setEstrategias(prev=>prev.filter(e=>e.id!==confirmDel)); setConfirmDel(null); setOpen(null) }}
          onNo={()=>setConfirmDel(null)}
        />
      )}
    </div>
  )
}

export { STATUS as ESTRATEGIA_STATUS, statusInfo as estrategiaStatusInfo }
