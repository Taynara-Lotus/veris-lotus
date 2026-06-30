import { useState } from 'react'

const GOLD='#68541F',BEIGE='#CDC9B8',JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'

const STATUS_OPTIONS=[
  {value:'concluido', label:'Concluído', color:'#2E7D32'},
  {value:'pendente',  label:'Pendente',  color:'#C62828'},
  {value:'a_iniciar', label:'A iniciar', color:'#E65100'},
]

function fmt(d){ return d?new Date(d).toLocaleDateString('pt-BR'):'' }

function statusBadge(status){
  const s=STATUS_OPTIONS.find(x=>x.value===status)
  if(!s) return null
  return(
    <span style={{
      display:'inline-block',padding:'2px 8px',borderRadius:10,
      background:s.color+'22',color:s.color,
      fontSize:10,fontWeight:700,letterSpacing:.4,border:`1px solid ${s.color}44`
    }}>{s.label}</span>
  )
}

function Confirm({msg,onYes,onNo}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{background:WHITE,borderRadius:12,padding:28,maxWidth:340,width:'90%',boxShadow:'0 8px 40px rgba(0,0,0,.4)'}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>⚠️ Confirmar</div>
      <div style={{fontSize:13,color:'#555',marginBottom:22}}>{msg}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button onClick={onNo} style={{background:'transparent',border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
        <button onClick={onYes} style={{background:'#C0392B',border:'1.5px solid #C0392B',color:WHITE,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Confirmar</button>
      </div>
    </div>
  </div>
}

export default function GestaoRegistros({registros,atividades,onDeleteRegistro,onResetSerial}){
  const[open,setOpen]=useState(null)
  const[search,setSearch]=useState('')
  const[confirmDel,setConfirmDel]=useState(null)
  const[confirmReset,setConfirmReset]=useState(false)

  const getColor=atv=>atividades.find(a=>(a.name||a)===atv)?.color||GOLD

  const sorted=[...registros].sort((a,b)=>{
    const sA=parseInt(a.serial?.replace('#','')||'0')
    const sB=parseInt(b.serial?.replace('#','')||'0')
    return sB-sA
  })

  const filtered=sorted.filter(r=>{
    const q=search.toLowerCase()
    return !q||r.serial?.toLowerCase().includes(q)||r.atividade?.toLowerCase().includes(q)||r.pavimento?.toLowerCase().includes(q)||r.responsavel?.toLowerCase().includes(q)
  })

  const downloadFile=(data,name)=>{
    const a=document.createElement('a')
    a.href=data;a.download=name;a.click()
  }

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <h2 style={{color:GOLD,margin:0,fontWeight:300,letterSpacing:1}}>Gestão de Registros</h2>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{fontSize:13,color:'#888'}}>{registros.length} registro(s)</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..."
            style={{border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 12px',fontSize:13,outline:'none',width:200}}/>
          {/* [FIX] Botão de zerar numeração */}
          <button onClick={()=>setConfirmReset(true)}
            style={{background:'transparent',border:'1.5px solid #C0392B',color:'#C0392B',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',letterSpacing:.3}}>
            🔄 Zerar nº de série
          </button>
        </div>
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:'center',padding:60,color:'#BBB',fontSize:14}}>
          {registros.length===0?'Nenhum registro criado ainda.':'Nenhum resultado encontrado.'}
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {filtered.map(reg=>{
          const isOpen=open===reg.id
          const cor=getColor(reg.atividade)
          // conta comentários pendentes para exibir no card fechado
          const pendentes=reg.coments?.filter(c=>c.status==='pendente').length||0

          return(
            <div key={reg.id} style={{border:`1px solid ${BEIGE}`,borderRadius:10,overflow:'hidden',background:WHITE,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
              {/* ROW */}
              <div onClick={()=>setOpen(isOpen?null:reg.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer',background:isOpen?'#EDE8DF':WHITE,transition:'background .15s'}}>
                {/* ícone câmera com badge de pendentes */}
                <div style={{position:'relative',width:24,height:24,flexShrink:0}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:cor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>📷</div>
                  {pendentes>0&&(
                    <div style={{position:'absolute',top:-4,right:-4,width:14,height:14,borderRadius:'50%',background:'#C62828',border:'1.5px solid white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:WHITE,lineHeight:1}}>
                      {pendentes}
                    </div>
                  )}
                </div>
                <div style={{minWidth:90,fontWeight:700,color:GOLD,fontSize:13}}>{reg.serial||'—'}</div>
                <div style={{flex:1,fontSize:13,color:JET,fontWeight:500}}>{reg.atividade||'—'}</div>
                <div style={{fontSize:12,color:'#888',minWidth:120}}>{reg.pavimento||'—'}</div>
                {pendentes>0&&(
                  <div style={{fontSize:10,color:'#C62828',fontWeight:600,whiteSpace:'nowrap'}}>
                    ⚠ {pendentes} pendente{pendentes>1?'s':''}
                  </div>
                )}
                <div style={{fontSize:11,color:'#AAA',minWidth:130,textAlign:'right'}}>{reg.horario||'—'}</div>
                <div style={{fontSize:14,color:'#CCC',marginLeft:6}}>{isOpen?'▲':'▼'}</div>
              </div>

              {/* EXPANDED */}
              {isOpen&&(
                <div style={{padding:'14px 18px',borderTop:`1px solid ${BEIGE}`,background:'#FEFEFE'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                    {[['Nº de Série',reg.serial],['Responsável',reg.responsavel],['Pavimento',reg.pavimento],['Atividade',reg.atividade],['Junta',reg.junta],['Criado em',reg.horario]].map(([k,v])=>v?(
                      <div key={k}>
                        <div style={{fontSize:10,color:'#AAA',letterSpacing:.8,textTransform:'uppercase'}}>{k}</div>
                        <div style={{fontSize:13,color:JET,marginTop:2}}>{v}</div>
                      </div>
                    ):null)}
                    {reg.geo_lat&&<div>
                      <div style={{fontSize:10,color:'#AAA',letterSpacing:.8,textTransform:'uppercase'}}>WGS84</div>
                      <div style={{fontSize:12,color:JET,marginTop:2}}>{reg.geo_lat}, {reg.geo_lng}</div>
                    </div>}
                    {reg.utm_zone&&<div>
                      <div style={{fontSize:10,color:'#AAA',letterSpacing:.8,textTransform:'uppercase'}}>UTM</div>
                      <div style={{fontSize:12,color:JET,marginTop:2}}>Zona {reg.utm_zone} · E {reg.utm_e} / N {reg.utm_n}</div>
                    </div>}
                    {reg.drive&&<div style={{gridColumn:'1/-1'}}>
                      <div style={{fontSize:10,color:'#AAA',letterSpacing:.8,textTransform:'uppercase'}}>Drive</div>
                      <a href={reg.drive} target="_blank" rel="noreferrer" style={{fontSize:12,color:GOLD}}>🔗 {reg.drive}</a>
                    </div>}
                  </div>

                  {/* FOTOS */}
                  {reg.fotos?.length>0&&<div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:6}}>Fotos ({reg.fotos.length})</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {reg.fotos.map((f,i)=>(
                        <div key={i} style={{position:'relative'}}>
                          <img src={f.data} alt={f.nome} style={{width:100,height:75,objectFit:'cover',borderRadius:6,border:`1px solid ${BEIGE}`}}/>
                          <button onClick={()=>downloadFile(f.data,f.nome||`foto_${i+1}.jpg`)}
                            style={{position:'absolute',bottom:4,right:4,background:'rgba(0,0,0,.6)',border:'none',color:WHITE,borderRadius:4,padding:'2px 5px',fontSize:10,cursor:'pointer'}}>⬇</button>
                        </div>
                      ))}
                    </div>
                  </div>}

                  {/* NFs */}
                  {reg.nfs?.filter(n=>n.arquivo).length>0&&<div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:4}}>Notas Fiscais</div>
                    {reg.nfs.filter(n=>n.arquivo).map((n,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,marginBottom:3}}>
                        <span>📎 {n.nomeArq||n.nome}</span>
                        <button onClick={()=>downloadFile(n.arquivo,n.nomeArq||'nota.pdf')} style={{background:GOLD,border:'none',color:WHITE,borderRadius:4,padding:'2px 8px',fontSize:11,cursor:'pointer'}}>⬇ Baixar</button>
                      </div>
                    ))}
                  </div>}

                  {/* CATÁLOGOS */}
                  {reg.cats?.filter(c=>c.arquivo).length>0&&<div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:4}}>Catálogos Técnicos</div>
                    {reg.cats.filter(c=>c.arquivo).map((c,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,marginBottom:3}}>
                        <span>📎 {c.nomeArq||c.nome}</span>
                        <button onClick={()=>downloadFile(c.arquivo,c.nomeArq||'catalogo.pdf')} style={{background:GOLD,border:'none',color:WHITE,borderRadius:4,padding:'2px 8px',fontSize:11,cursor:'pointer'}}>⬇ Baixar</button>
                      </div>
                    ))}
                  </div>}

                  {/* [FIX] COMENTÁRIOS com status, usuário e badge */}
                  {reg.coments?.length>0&&<div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:6}}>
                      Comentários ({reg.coments.length})
                      {pendentes>0&&<span style={{marginLeft:8,background:'#C62828',color:WHITE,borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{pendentes} pendente{pendentes>1?'s':''}</span>}
                    </div>
                    {reg.coments.map((c,i)=>(
                      <div key={i} style={{background:OFF,borderRadius:6,padding:'10px 12px',marginBottom:6,fontSize:12,borderLeft:`3px solid ${STATUS_OPTIONS.find(s=>s.value===c.status)?.color||BEIGE}`}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                          {c.status&&statusBadge(c.status)}
                          {c.usuario&&<span style={{color:'#666',fontWeight:600}}>👤 {c.usuario}</span>}
                          <span style={{color:'#AAA',marginLeft:'auto'}}>{fmt(c.data)}</span>
                        </div>
                        {c.responsavel&&<div style={{color:'#888',marginBottom:3,fontSize:11}}>Responsável: {c.responsavel}</div>}
                        <div style={{color:JET,lineHeight:1.5}}>{c.descricao}</div>
                      </div>
                    ))}
                  </div>}

                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
                    <button onClick={()=>setConfirmDel(reg.id)} style={{background:'#C0392B',border:'none',color:WHITE,borderRadius:6,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer'}}>🗑️ Excluir Registro</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm delete */}
      {confirmDel&&<Confirm
        msg={`Deseja realmente excluir o registro ${registros.find(r=>r.id===confirmDel)?.serial}?`}
        onYes={async()=>{await onDeleteRegistro(confirmDel);setConfirmDel(null);setOpen(null);}}
        onNo={()=>setConfirmDel(null)}
      />}

      {/* [FIX] Confirm reset serial */}
      {confirmReset&&<Confirm
        msg="Isso irá zerar o contador de nº de série. Os registros existentes não serão alterados, mas os próximos começarão do #000001. Confirmar?"
        onYes={()=>{if(onResetSerial)onResetSerial();setConfirmReset(false);}}
        onNo={()=>setConfirmReset(false)}
      />}
    </div>
  )
}
