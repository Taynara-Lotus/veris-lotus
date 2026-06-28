import { useState } from 'react'

const GOLD='#68541F',BEIGE='#CDC9B8',JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'

function fmt(d){ return d?new Date(d).toLocaleDateString('pt-BR'):'' }

function Confirm({msg,onYes,onNo}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{background:WHITE,borderRadius:12,padding:28,maxWidth:340,width:'90%',boxShadow:'0 8px 40px rgba(0,0,0,.4)'}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>⚠️ Confirmar exclusão</div>
      <div style={{fontSize:13,color:'#555',marginBottom:22}}>{msg}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button onClick={onNo} style={{background:'transparent',border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
        <button onClick={onYes} style={{background:'#C0392B',border:'1.5px solid #C0392B',color:WHITE,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Excluir</button>
      </div>
    </div>
  </div>
}

export default function GestaoRegistros({registros,atividades,onDeleteRegistro}){
  const[open,setOpen]=useState(null)
  const[search,setSearch]=useState('')
  const[confirmDel,setConfirmDel]=useState(null)

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
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:13,color:'#888'}}>{registros.length} registro(s)</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..."
            style={{border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 12px',fontSize:13,outline:'none',width:200}}/>
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
          return(
            <div key={reg.id} style={{border:`1px solid ${BEIGE}`,borderRadius:10,overflow:'hidden',background:WHITE,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
              {/* ROW */}
              <div onClick={()=>setOpen(isOpen?null:reg.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer',background:isOpen?'#EDE8DF':WHITE,transition:'background .15s'}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:cor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>📷</div>
                <div style={{minWidth:90,fontWeight:700,color:GOLD,fontSize:13}}>{reg.serial||'—'}</div>
                <div style={{flex:1,fontSize:13,color:JET,fontWeight:500}}>{reg.atividade||'—'}</div>
                <div style={{fontSize:12,color:'#888',minWidth:120}}>{reg.pavimento||'—'}</div>
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

                  {/* COMENTÁRIOS */}
                  {reg.coments?.length>0&&<div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:4}}>Comentários</div>
                    {reg.coments.map((c,i)=>(
                      <div key={i} style={{background:OFF,borderRadius:6,padding:'8px 10px',marginBottom:5,fontSize:12}}>
                        <div style={{color:'#888',marginBottom:2}}>{fmt(c.data)} · {c.responsavel}</div>
                        <div>{c.descricao}</div>
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

      {confirmDel&&<Confirm
        msg={`Deseja realmente excluir o registro ${registros.find(r=>r.id===confirmDel)?.serial}?`}
        onYes={async()=>{await onDeleteRegistro(confirmDel);setConfirmDel(null);setOpen(null);}}
        onNo={()=>setConfirmDel(null)}
      />}
    </div>
  )
}
