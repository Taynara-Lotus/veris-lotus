import { useState, useRef, useEffect, useCallback } from 'react'

const GOLD='#68541F',GOLD2='#8B6F2E',BEIGE='#CDC9B8',BEIGE2='#EDE8DF'
const JET='#1A1A18',JET2='#2C2C28',WHITE='#FFFFFF',OFF='#F7F5F0'

const PRESET_COLORS=['#68541F','#8B6F2E','#A0522D','#6D4C41','#4E342E','#3E2723','#2E7D32','#388E3C','#1B5E20','#1565C0','#0D47A1','#C62828','#AD1457','#E65100','#F9A825','#FFD600','#6A1B9A','#4A148C','#212121','#616161','#9E9E9E','#00838F','#37474F']

const STATUS_COMENT=[
  {value:'concluido',label:'Concluído',color:'#2E7D32'},
  {value:'pendente', label:'Pendente', color:'#C62828'},
  {value:'a_iniciar',label:'A iniciar',color:'#E65100'},
]

const STATUS_DOC=[
  {value:'pendente',     label:'Pendente',     color:'#C62828'},
  {value:'validar',      label:'Validar',      color:'#E65100'},
  {value:'validado',     label:'Validado',     color:'#2E7D32'},
  {value:'nao_se_aplica',label:'Não se aplica',color:'#888'},
]

function docStatusBadge(status){
  const s=STATUS_DOC.find(x=>x.value===status)
  if(!s) return null
  return <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:10,background:s.color+'22',color:s.color,border:`1px solid ${s.color}44`,letterSpacing:.3}}>{s.label}</span>
}

function latLngToUTM(lat,lng){
  const a=6378137,f=1/298.257223563,b=a*(1-f),e2=(a*a-b*b)/(a*a),k0=0.9996,E0=500000,N0=lat<0?10000000:0
  const latR=lat*Math.PI/180,lngR=lng*Math.PI/180
  const zone=Math.floor((lng+180)/6)+1
  const lng0=((zone-1)*6-180+3)*Math.PI/180
  const N=a/Math.sqrt(1-e2*Math.sin(latR)**2)
  const T=Math.tan(latR)**2,C=e2/(1-e2)*Math.cos(latR)**2,A=Math.cos(latR)*(lngR-lng0)
  const M=a*((1-e2/4-3*e2*e2/64)*latR-(3*e2/8+3*e2*e2/32)*Math.sin(2*latR)+(15*e2*e2/256)*Math.sin(4*latR))
  const easting=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T)*A**5/120)+E0
  const northing=k0*(M+N*Math.tan(latR)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T)*A**6/720))+N0
  return{zone:`${zone}${lat<0?'S':'N'}`,E:Math.round(easting),N:Math.round(northing)}
}

function nowStr(){return new Date().toLocaleString('pt-BR')}
function fmtDate(iso){return iso?new Date(iso).toLocaleString('pt-BR'):''}

import { nextSerial } from '../App'

function Btn({children,onClick,color=GOLD,small,outline,disabled,danger}){
  const c=danger?'#C0392B':color
  return <button onClick={onClick} disabled={disabled} style={{background:outline?'transparent':c,color:outline?c:WHITE,border:`1.5px solid ${c}`,borderRadius:6,padding:small?'4px 12px':'9px 22px',fontSize:small?12:13,fontWeight:600,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.5:1,transition:'all .2s',letterSpacing:.4}}>{children}</button>
}

function Inp({label,value,onChange,type='text',placeholder}){
  return <div style={{marginBottom:10}}>
    {label&&<label style={{fontSize:11,color:'#888',display:'block',marginBottom:3,letterSpacing:.5,textTransform:'uppercase'}}>{label}</label>}
    <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:'100%',boxSizing:'border-box',border:'1px solid #D4C9B0',borderRadius:6,padding:'7px 10px',fontSize:13,background:WHITE,outline:'none'}}/>
  </div>
}

function StatusDocSel({value, onChange}){
  return(
    <div style={{marginBottom:8}}>
      <label style={{fontSize:11,color:'#888',display:'block',marginBottom:4,letterSpacing:.5,textTransform:'uppercase'}}>Status</label>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {STATUS_DOC.map(s=>(
          <button key={s.value} onClick={()=>onChange(s.value)}
            style={{padding:'4px 10px',borderRadius:10,border:`1.5px solid ${s.color}`,background:value===s.value?s.color:'transparent',color:value===s.value?WHITE:s.color,fontSize:10,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Sec({title,children,defaultOpen=true}){
  const[open,setOpen]=useState(defaultOpen)
  return <div style={{marginBottom:12,border:'1px solid #E8E0CF',borderRadius:8,overflow:'hidden'}}>
    <div onClick={()=>setOpen(!open)} style={{background:BEIGE2,padding:'8px 12px',cursor:'pointer',fontWeight:700,fontSize:12,color:GOLD,display:'flex',justifyContent:'space-between',letterSpacing:.5,textTransform:'uppercase'}}>
      {title}<span style={{opacity:.6}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div style={{padding:'10px 12px'}}>{children}</div>}
  </div>
}

function Confirm({msg,onYes,onNo}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{background:WHITE,borderRadius:12,padding:28,maxWidth:340,width:'90%',boxShadow:'0 8px 40px rgba(0,0,0,.4)'}}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>⚠️ Confirmar exclusão</div>
      <div style={{fontSize:13,color:'#555',marginBottom:22}}>{msg}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn small outline onClick={onNo}>Cancelar</Btn>
        <Btn small danger onClick={onYes}>Excluir</Btn>
      </div>
    </div>
  </div>
}

function Sel({label,value,onChange,options,allowNew,onAddNew,onRemove,withColor}){
  const[adding,setAdding]=useState(false)
  const[nv,setNv]=useState('')
  const[nc,setNc]=useState(PRESET_COLORS[0])
  return <div style={{marginBottom:10}}>
    {label&&<label style={{fontSize:11,color:'#888',display:'block',marginBottom:3,letterSpacing:.5,textTransform:'uppercase'}}>{label}</label>}
    <div style={{display:'flex',gap:6}}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{flex:1,border:'1px solid #D4C9B0',borderRadius:6,padding:'7px 10px',fontSize:13,background:WHITE}}>
        <option value=''>— selecione —</option>
        {options.map(o=><option key={o.name||o} value={o.name||o}>{o.name||o}</option>)}
      </select>
      {allowNew&&!adding&&<Btn small outline onClick={()=>setAdding(true)}>+ Novo</Btn>}
      {onRemove&&value&&<Btn small danger outline onClick={()=>{onRemove(value);onChange('');}}>✕</Btn>}
    </div>
    {adding&&<div style={{marginTop:6}}>
      <input value={nv} onChange={e=>setNv(e.target.value)} placeholder="Nome" style={{width:'100%',boxSizing:'border-box',border:'1px solid #D4C9B0',borderRadius:6,padding:'6px 10px',fontSize:13,marginBottom:6}}/>
      {withColor&&<div style={{marginBottom:8}}>
        <label style={{fontSize:11,color:'#888',display:'block',marginBottom:4}}>COR DO ÍCONE</label>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
          {PRESET_COLORS.map(c=><div key={c} onClick={()=>setNc(c)} style={{width:20,height:20,borderRadius:'50%',background:c,cursor:'pointer',border:nc===c?'3px solid #fff':'2px solid transparent',boxShadow:nc===c?`0 0 0 2px ${c}`:'none'}}/>)}
          <input type="color" value={nc} onChange={e=>setNc(e.target.value)} style={{width:20,height:20,borderRadius:'50%',border:'none',cursor:'pointer',padding:0}}/>
        </div>
      </div>}
      <div style={{display:'flex',gap:4}}>
        <Btn small onClick={()=>{if(nv.trim()){onAddNew(nv.trim(),nc);onChange(nv.trim());}setAdding(false);setNv('');}}>OK</Btn>
        <Btn small outline onClick={()=>{setAdding(false);setNv('');}}>✕</Btn>
      </div>
    </div>}
  </div>
}

function CorteInterno({pavimentos,pavAtivo,setPavAtivo,registros}){
  const ordered=[...pavimentos].reverse()
  const getH=p=>p==='Cobertura'?28:/subsolo/i.test(p)?18:p==='Mezanino'?20:21
  const getW=(p,mW)=>p==='Cobertura'?mW*.68:/4º subsolo/i.test(p)?mW:/3º subsolo/i.test(p)?mW*.96:/2º subsolo/i.test(p)?mW*.92:/1º subsolo/i.test(p)?mW*.88:mW*.84
  const maxW=138,svgW=maxW+4
  const totalH=ordered.reduce((s,p)=>s+getH(p),0)+4
  let yPos=2
  const rects=ordered.map(pav=>{const h=getH(pav),w=getW(pav,maxW),x=(svgW-w)/2,r={pav,x,y:yPos,w,h};yPos+=h;return r;})
  const terreoRect=rects.find(r=>/térreo/i.test(r.pav))
  return(
    <svg width={svgW} height={totalH+4} style={{display:'block',overflow:'visible'}}>
      {rects.map(({pav,x,y,w,h})=>{
        const active=pav===pavAtivo,isC=pav==='Cobertura',isSub=/subsolo/i.test(pav),hasReg=registros.some(r=>r.pavimento===pav)
        return <g key={pav} onClick={()=>setPavAtivo(pav)} style={{cursor:'pointer'}}>
          <rect x={x} y={y} width={w} height={h-1} fill={active?GOLD:isC?'#555':isSub?'#28281E':'#232320'} stroke={active?GOLD2:isC?'#666':'#3A3A34'} strokeWidth={active?1.5:.5} rx={isC?3:1}/>
          {hasReg&&!active&&<circle cx={x+w-5} cy={y+h/2-.5} r={2.5} fill={GOLD} opacity={.8}/>}
          <text x={svgW/2} y={y+h/2+3.5} textAnchor="middle" fontSize={isC?8:7} fontWeight={active?'700':'400'} fill={active?WHITE:isC?BEIGE:'#777'} fontFamily="'Helvetica Neue',Arial,sans-serif">{pav}</text>
        </g>
      })}
      {terreoRect&&<line x1={0} y1={terreoRect.y+terreoRect.h} x2={svgW} y2={terreoRect.y+terreoRect.h} stroke={GOLD} strokeWidth={1.2} strokeDasharray="4,3" opacity={.55}/>}
    </svg>
  )
}

function CameraIcon({reg,onClick,style}){
  // Conta só pendentes (excluindo concluídos)
  const pendentes=reg.coments?.filter(c=>c.status==='pendente').length||0
  return(
    <div onClick={onClick} title={`${reg.serial||''} · ${reg.atividade||'Registro'}`}
      style={{...style,position:'absolute',cursor:'pointer'}}>
      📷
      {pendentes>0&&(
        <div style={{position:'absolute',top:-5,right:-5,width:15,height:15,borderRadius:'50%',background:'#C62828',border:'1.5px solid white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:WHITE,lineHeight:1}}>{pendentes}</div>
      )}
    </div>
  )
}

function MiniGuia({existing,pavAtivo,juntas,atividades,onSaveJunta,onDeleteJunta,onSaveAtividade,onDeleteAtividade,onClose,onSave,onDelete,registros,plantaNome,plantaUpdatedAt,empId}){
  const[fotos,setFotos]=useState(existing?.fotos||[])
  const horario=existing?.horario||nowStr()
  const[junta,setJunta]=useState(existing?.junta||'')
  const[pavimento,setPav]=useState(existing?.pavimento||pavAtivo||'')
  const[geo,setGeo]=useState(existing?.geo_lat?{lat:existing.geo_lat,lng:existing.geo_lng}:null)
  const[utmCoord,setUtmCoord]=useState(existing?.utm_zone?{zone:existing.utm_zone,E:existing.utm_e,N:existing.utm_n}:null)
  const[geoLoading,setGeoLoading]=useState(false)
  const[atividade,setAtiv]=useState(existing?.atividade||'')
  const[responsavel,setResp]=useState(existing?.responsavel||'')
  const[nfs,setNfs]=useState(existing?.nfs||[])
  const[cats,setCats]=useState(existing?.cats||[])
  const[coments,setComents]=useState(existing?.coments||[])
  const[drive,setDrive]=useState(existing?.drive||'')
  const[confirmDel,setConfirmDel]=useState(false)
  const serial=existing?.serial||nextSerial(empId)

  const handleGetUTM=()=>{
    if(!navigator.geolocation){alert('Geolocalização não disponível.');return}
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(p=>{
      const lat=p.coords.latitude,lng=p.coords.longitude
      setGeo({lat:lat.toFixed(6),lng:lng.toFixed(6)})
      try{const u=latLngToUTM(lat,lng);setUtmCoord(u);}catch{}
      setGeoLoading(false)
    },()=>{alert('Não foi possível obter localização.');setGeoLoading(false)})
  }

  const readFile=(f,cb)=>{const r=new FileReader();r.onload=ev=>cb(ev.target.result,f.name);r.readAsDataURL(f);}
  const addFotos=e=>Array.from(e.target.files).forEach(f=>readFile(f,(d,nm)=>setFotos(prev=>[...prev,{data:d,nome:nm}])))
  const removeFoto=i=>setFotos(fotos.filter((_,j)=>j!==i))
  const getColor=atv=>atividades.find(a=>(a.name||a)===atv)?.color||GOLD

  const handleSave=()=>{
    onSave({fotos,horario,junta,pavimento,geo_lat:geo?.lat,geo_lng:geo?.lng,utm_zone:utmCoord?.zone,utm_e:utmCoord?.E,utm_n:utmCoord?.N,atividade,responsavel,nfs,cats,coments,drive,serial})
  }

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:WHITE,borderRadius:14,width:'min(600px,97vw)',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 12px 60px rgba(0,0,0,.4)'}}>
        <div style={{background:JET,color:WHITE,padding:'12px 16px',borderRadius:'14px 14px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:5}}>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <span style={{fontWeight:700,fontSize:14}}>{existing?'✏️ Editar':'📍 Novo'} Registro</span>
            <span style={{fontSize:12,color:GOLD,fontWeight:700}}>{serial}</span>
            {plantaNome&&<span style={{fontSize:10,color:'#777',fontStyle:'italic'}}>📄 {plantaNome}{plantaUpdatedAt?` · ${fmtDate(plantaUpdatedAt)}`:''}</span>}
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:WHITE,fontSize:18,cursor:'pointer'}}>✕</button>
        </div>

        <div style={{padding:16}}>
          <Sec title="📷 Fotos">
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:10}}>
              {fotos.map((f,i)=>(
                <div key={i} style={{position:'relative',width:90,height:70}}>
                  <img src={f.data} alt={f.nome} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6,border:`1px solid ${BEIGE}`}}/>
                  <button onClick={()=>removeFoto(i)} style={{position:'absolute',top:-5,right:-5,width:18,height:18,borderRadius:'50%',background:'#C0392B',border:'none',color:WHITE,fontSize:11,cursor:'pointer'}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <label style={{display:'flex',alignItems:'center',gap:6,background:WHITE,border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                🖼 Galeria<input type="file" accept="image/*" multiple style={{display:'none'}} onChange={addFotos}/>
              </label>
              <label style={{display:'flex',alignItems:'center',gap:6,background:GOLD,border:`1.5px solid ${GOLD}`,color:WHITE,borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                📷 Câmera<input type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={addFotos}/>
              </label>
            </div>
          </Sec>

          <Sec title="ℹ️ Informações Gerais">
            <div style={{fontSize:12,color:'#888',marginBottom:4}}>🕐 <b>{horario}</b></div>
            {geo&&<div style={{fontSize:12,color:'#888',marginBottom:2}}>📍 WGS84: <b>{geo.lat}, {geo.lng}</b></div>}
            {utmCoord
              ?<div style={{fontSize:12,color:'#888',marginBottom:8,background:BEIGE2,borderRadius:6,padding:'6px 10px'}}>📐 UTM Zona <b>{utmCoord.zone}</b> · E <b>{utmCoord.E}</b> / N <b>{utmCoord.N}</b></div>
              :<div style={{marginBottom:8}}>
                <button onClick={handleGetUTM} disabled={geoLoading}
                  style={{background:geoLoading?'#888':JET2,color:WHITE,border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:600,cursor:geoLoading?'not-allowed':'pointer'}}>
                  {geoLoading?'📡 Obtendo…':'📐 Gerar coordenadas UTM'}
                </button>
              </div>
            }
            <Inp label="Responsável pelo Registro" value={responsavel} onChange={setResp}/>
            <Sel label="Junta" value={junta} onChange={setJunta} options={juntas} allowNew onAddNew={v=>onSaveJunta(v)} onRemove={v=>onDeleteJunta(v)}/>
            <Inp label="Pavimento" value={pavimento} onChange={setPav}/>
            <Sel label="Tipo de Atividade" value={atividade} onChange={setAtiv} options={atividades} allowNew withColor onAddNew={(v,c)=>onSaveAtividade(v,c)} onRemove={v=>onDeleteAtividade(v)}/>
            {atividade&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:-4,marginBottom:8}}>
              <div style={{width:16,height:16,borderRadius:'50%',background:getColor(atividade),border:'2px solid rgba(0,0,0,.15)'}}/>
              <span style={{fontSize:12,color:'#888'}}>{atividade}</span>
            </div>}
          </Sec>

          {/* NOTAS FISCAIS com status */}
          <Sec title="📄 Notas Fiscais" defaultOpen={false}>
            {nfs.map((n,i)=>(
              <div key={i} style={{background:OFF,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${BEIGE}`,position:'relative'}}>
                <button onClick={()=>setNfs(nfs.filter((_,j)=>j!==i))} style={{position:'absolute',top:6,right:6,background:'#C0392B',border:'none',color:WHITE,borderRadius:4,width:18,height:18,cursor:'pointer',fontSize:11}}>✕</button>
                <Inp label="Nome do Material" value={n.nome} onChange={v=>setNfs(nfs.map((x,j)=>j===i?{...x,nome:v}:x))}/>
                {/* STATUS do documento */}
                <StatusDocSel value={n.status} onChange={v=>setNfs(nfs.map((x,j)=>j===i?{...x,status:v}:x))}/>
                {n.nomeArq
                  ?<div style={{fontSize:12,color:GOLD,display:'flex',alignItems:'center',gap:8}}>📎 {n.nomeArq} {docStatusBadge(n.status)}</div>
                  :<label style={{fontSize:12,color:GOLD2,cursor:'pointer'}}>📁 Adicionar PDF<input type="file" accept=".pdf" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)readFile(f,(d,nm)=>setNfs(nfs.map((x,j)=>j===i?{...x,arquivo:d,nomeArq:nm}:x)));}} /></label>
                }
              </div>
            ))}
            <Btn small outline onClick={()=>setNfs([...nfs,{nome:'',status:'pendente'}])}>+ Adicionar NF</Btn>
          </Sec>

          {/* CATÁLOGO TÉCNICO com status */}
          <Sec title="📚 Catálogo Técnico" defaultOpen={false}>
            {cats.map((c,i)=>(
              <div key={i} style={{background:OFF,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${BEIGE}`,position:'relative'}}>
                <button onClick={()=>setCats(cats.filter((_,j)=>j!==i))} style={{position:'absolute',top:6,right:6,background:'#C0392B',border:'none',color:WHITE,borderRadius:4,width:18,height:18,cursor:'pointer',fontSize:11}}>✕</button>
                <Inp label="Nome do Material" value={c.nome} onChange={v=>setCats(cats.map((x,j)=>j===i?{...x,nome:v}:x))}/>
                {/* STATUS do catálogo */}
                <StatusDocSel value={c.status} onChange={v=>setCats(cats.map((x,j)=>j===i?{...x,status:v}:x))}/>
                {c.nomeArq
                  ?<div style={{fontSize:12,color:GOLD,display:'flex',alignItems:'center',gap:8}}>📎 {c.nomeArq} {docStatusBadge(c.status)}</div>
                  :<label style={{fontSize:12,color:GOLD2,cursor:'pointer'}}>📁 Adicionar Arquivo<input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)readFile(f,(d,nm)=>setCats(cats.map((x,j)=>j===i?{...x,arquivo:d,nomeArq:nm}:x)));}} /></label>
                }
              </div>
            ))}
            <Btn small outline onClick={()=>setCats([...cats,{nome:'',status:'pendente'}])}>+ Adicionar Catálogo</Btn>
          </Sec>

          {/* COMENTÁRIOS com status e badge correto (só pendentes) */}
          <Sec title="💬 Comentários" defaultOpen={false}>
            {coments.map((c,i)=>(
              <div key={i} style={{background:OFF,borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${BEIGE}`,position:'relative'}}>
                <button onClick={()=>setComents(coments.filter((_,j)=>j!==i))} style={{position:'absolute',top:6,right:6,background:'#C0392B',border:'none',color:WHITE,borderRadius:4,width:18,height:18,cursor:'pointer',fontSize:11}}>✕</button>
                <Inp label="Data" type="date" value={c.data} onChange={v=>setComents(coments.map((x,j)=>j===i?{...x,data:v}:x))}/>
                <Inp label="Usuário que adicionou" value={c.usuario} onChange={v=>setComents(coments.map((x,j)=>j===i?{...x,usuario:v}:x))}/>
                <Inp label="Responsável pela ação" value={c.responsavel} onChange={v=>setComents(coments.map((x,j)=>j===i?{...x,responsavel:v}:x))}/>
                <div style={{marginBottom:8}}>
                  <label style={{fontSize:11,color:'#888',display:'block',marginBottom:4,letterSpacing:.5,textTransform:'uppercase'}}>Status</label>
                  <div style={{display:'flex',gap:6}}>
                    {STATUS_COMENT.map(s=>(
                      <button key={s.value} onClick={()=>setComents(coments.map((x,j)=>j===i?{...x,status:s.value}:x))}
                        style={{flex:1,padding:'5px 0',borderRadius:6,border:`1.5px solid ${s.color}`,background:c.status===s.value?s.color:'transparent',color:c.status===s.value?WHITE:s.color,fontSize:11,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:6}}>
                  <label style={{fontSize:11,color:'#888',display:'block',marginBottom:3,letterSpacing:.5,textTransform:'uppercase'}}>Descrição</label>
                  <textarea value={c.descricao||''} rows={3} onChange={e=>setComents(coments.map((x,j)=>j===i?{...x,descricao:e.target.value}:x))} style={{width:'100%',boxSizing:'border-box',border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 10px',fontSize:13,resize:'vertical'}}/>
                </div>
              </div>
            ))}
            <Btn small outline onClick={()=>setComents([...coments,{data:new Date().toISOString().slice(0,10),usuario:'',responsavel:'',descricao:'',status:'a_iniciar'}])}>+ Adicionar Comentário</Btn>
          </Sec>

          <Sec title="🔗 Link do Drive" defaultOpen={false}>
            <Inp label="URL da Pasta" value={drive} onChange={setDrive} placeholder="https://drive.google.com/..."/>
            {drive&&<a href={drive} target="_blank" rel="noreferrer" style={{fontSize:12,color:GOLD2}}>🔗 Abrir pasta</a>}
          </Sec>

          <div style={{display:'flex',gap:10,marginTop:18,justifyContent:'flex-end'}}>
            {onDelete&&<Btn danger small onClick={()=>setConfirmDel(true)}>🗑️ Excluir</Btn>}
            <Btn outline small onClick={onClose}>Cancelar</Btn>
            <Btn onClick={handleSave}>✅ Registrar</Btn>
          </div>
        </div>
      </div>
      {confirmDel&&<Confirm msg={`Deseja realmente excluir o registro ${serial}?`} onYes={()=>{setConfirmDel(false);onDelete();}} onNo={()=>setConfirmDel(false)}/>}
    </div>
  )
}

export default function PlantaBaixa({plantas,setPlantas,onSavePlanta,onDeletePlanta,pavimentos,setPavimentos,pavAtivo,setPavAtivo,registros,modal,setModal,iconClicked,setIconClicked,juntas,atividades,onSaveRegistro,onDeleteRegistro,onSaveAtividade,onDeleteAtividade,onSaveJunta,onDeleteJunta,empId}){
  const canvasRef=useRef()
  const fileRef=useRef()
  const[addPav,setAddPav]=useState(false)
  const[newPav,setNewPav]=useState('')
  const[zoom,setZoom]=useState(1)
  const[pan,setPan]=useState({x:0,y:0})
  const[dragging,setDragging]=useState(false)
  const[lastTouch,setLastTouch]=useState(null)
  const[saving,setSaving]=useState(false)
  const dragStart=useRef(null)

  // plantas é agora { pavimento: { data, nome, updated_at } }
  const plantaObj=plantas[pavAtivo]
  const planta=plantaObj?.data||null
  const plantaNome=plantaObj?.nome||null
  const plantaUpdatedAt=plantaObj?.updated_at||null

  const handleWheel=useCallback(e=>{
    e.preventDefault()
    setZoom(z=>Math.min(5,Math.max(1,z+(e.deltaY>0?-.15:.15))))
  },[])

  useEffect(()=>{
    const el=canvasRef.current
    if(!el) return
    el.addEventListener('wheel',handleWheel,{passive:false})
    return()=>el.removeEventListener('wheel',handleWheel)
  },[handleWheel])

  const handleUpload=e=>{
    const f=e.target.files[0];if(!f) return
    const r=new FileReader()
    r.onload=ev=>{
      // Atualiza state local imediatamente para preview
      setPlantas(prev=>({...prev,[pavAtivo]:{data:ev.target.result,nome:f.name,updated_at:new Date().toISOString()}}))
    }
    r.readAsDataURL(f)
  }

  // Salva planta no Supabase
  const handleSavePlanta=async()=>{
    if(!planta){alert('Nenhuma planta carregada.');return}
    setSaving(true)
    await onSavePlanta(pavAtivo, planta, plantaNome||pavAtivo)
    setSaving(false)
    alert(`Planta "${plantaNome||pavAtivo}" salva com sucesso!`)
  }

  const handleImgClick=e=>{
    if(modal||iconClicked) return
    const rect=canvasRef.current.getBoundingClientRect()
    const x=((e.clientX-rect.left-pan.x)/zoom)/rect.width*100
    const y=((e.clientY-rect.top-pan.y)/zoom)/rect.height*100
    if(x<0||x>100||y<0||y>100) return
    setModal({x,y})
  }

  const handleTouchStart=e=>{if(e.touches.length===2)setLastTouch(Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))}
  const handleTouchMove=e=>{
    if(e.touches.length===2){
      e.preventDefault()
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)
      if(lastTouch){setZoom(z=>Math.min(5,Math.max(1,z*d/lastTouch)))}
      setLastTouch(d)
    }
  }
  const handleTouchEnd=()=>setLastTouch(null)
  const closeAll=()=>{setModal(null);setIconClicked(null);}
  const regsAtivos=registros.filter(r=>r.pavimento===pavAtivo)
  const getColor=atv=>atividades.find(a=>(a.name||a)===atv)?.color||GOLD

  return(
    <div style={{display:'flex',gap:0}}>
      {/* Painel de Pavimentos */}
      <div style={{width:160,flexShrink:0,background:JET,borderRadius:'10px 0 0 10px',padding:'14px 8px',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{fontSize:9,color:'#666',letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>Pavimentos</div>
        <div style={{width:'100%',overflowY:'auto',maxHeight:480}}>
          <CorteInterno pavimentos={pavimentos} pavAtivo={pavAtivo} setPavAtivo={setPavAtivo} registros={registros}/>
        </div>
        <div style={{marginTop:10,width:'100%',padding:'10px 4px 0',borderTop:'1px solid #2C2C28'}}>
          {addPav
            ?<div style={{display:'flex',flexDirection:'column',gap:4}}>
              <input value={newPav} onChange={e=>setNewPav(e.target.value)} placeholder="Nome" style={{fontSize:11,padding:'5px 8px',borderRadius:5,border:'1px solid #444',background:JET2,color:WHITE,width:'100%',boxSizing:'border-box'}}/>
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>{if(newPav.trim()){setPavimentos([...pavimentos,newPav.trim()]);setPavAtivo(newPav.trim());}setAddPav(false);setNewPav('');}} style={{flex:1,background:GOLD,color:WHITE,border:'none',borderRadius:5,padding:'5px 0',fontSize:11,cursor:'pointer'}}>OK</button>
                <button onClick={()=>{setAddPav(false);setNewPav('');}} style={{flex:1,background:'transparent',color:'#666',border:'1px solid #444',borderRadius:5,padding:'5px 0',fontSize:11,cursor:'pointer'}}>✕</button>
              </div>
            </div>
            :<div style={{display:'flex',flexDirection:'column',gap:4}}>
              <button onClick={()=>setAddPav(true)} style={{width:'100%',background:'transparent',border:'1px dashed #3E3E38',color:'#666',borderRadius:6,padding:'6px 0',fontSize:11,cursor:'pointer'}}>+ Pavimento</button>
              {pavimentos.length>1&&(
                <button onClick={()=>{
                  const idx=pavimentos.indexOf(pavAtivo)
                  const novo=pavimentos.filter(p=>p!==pavAtivo)
                  setPavimentos(novo)
                  setPavAtivo(novo[Math.max(0,idx-1)]||novo[0])
                  if(onDeletePlanta) onDeletePlanta(pavAtivo)
                  setPlantas(prev=>{const n={...prev};delete n[pavAtivo];return n})
                }} style={{width:'100%',background:'transparent',border:'1px dashed #6B2020',color:'#C0392B',borderRadius:6,padding:'6px 0',fontSize:11,cursor:'pointer'}}>− Excluir pavimento</button>
              )}
            </div>
          }
        </div>
      </div>

      {/* Área da planta */}
      <div style={{flex:1,background:WHITE,borderRadius:'0 10px 10px 0',border:`1px solid ${BEIGE}`,borderLeft:'none',overflow:'hidden'}}>
        <div style={{background:BEIGE2,padding:'8px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${BEIGE}`}}>
          <div>
            <span style={{fontSize:12,fontWeight:700,color:GOLD}}>{pavAtivo}</span>
            {plantaNome&&<span style={{marginLeft:10,fontSize:10,color:'#999',fontStyle:'italic'}}>📄 {plantaNome}</span>}
            {plantaUpdatedAt&&<span style={{marginLeft:8,fontSize:9,color:'#bbb'}}>· atualizada em {fmtDate(plantaUpdatedAt)}</span>}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {planta&&<>
              <button onClick={()=>setZoom(z=>Math.max(1,z-.25))} style={{background:JET2,color:WHITE,border:'none',borderRadius:5,width:26,height:26,cursor:'pointer',fontSize:16}}>−</button>
              <span style={{fontSize:11,color:'#888',minWidth:36,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
              <button onClick={()=>setZoom(z=>Math.min(5,z+.25))} style={{background:JET2,color:WHITE,border:'none',borderRadius:5,width:26,height:26,cursor:'pointer',fontSize:16}}>+</button>
              <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} style={{background:'transparent',border:`1px solid ${BEIGE}`,borderRadius:5,padding:'4px 8px',fontSize:11,cursor:'pointer',color:'#888'}}>Reset</button>
            </>}
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={handleUpload}/>
            {/* Salvar persiste no Supabase */}
            {planta&&(
              <button onClick={handleSavePlanta} disabled={saving}
                style={{background:saving?'#888':GOLD,border:`1.5px solid ${saving?'#888':GOLD}`,color:WHITE,borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:600,cursor:saving?'not-allowed':'pointer'}}>
                {saving?'Salvando…':'💾 Salvar'}
              </button>
            )}
            <button onClick={()=>fileRef.current.click()} style={{background:'transparent',border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
              📁 {planta?'Trocar':'Carregar'}
            </button>
          </div>
        </div>

        <div style={{overflow:'hidden',position:'relative',minHeight:440,cursor:zoom>1?'grab':'crosshair',background:'#FAFAF8'}}
          ref={canvasRef}
          onMouseDown={e=>{if(zoom>1){setDragging(true);dragStart.current={x:e.clientX-pan.x,y:e.clientY-pan.y};}}}
          onMouseMove={e=>{if(dragging&&zoom>1)setPan({x:e.clientX-dragStart.current.x,y:e.clientY-dragStart.current.y});}}
          onMouseUp={()=>setDragging(false)}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          {!planta && regsAtivos.length===0 ?(
            <div onClick={()=>fileRef.current.click()} style={{height:440,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#BBB',gap:10}}>
              <div style={{fontSize:44}}>🗺️</div>
              <div style={{fontSize:14}}>Adicionar planta para <b>{pavAtivo}</b></div>
            </div>
          ):(
            <div style={{position:'relative',minHeight:440}} onClick={handleImgClick}>
              {/* Imagem da planta (se carregada) */}
              {planta
                ? <div style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,transformOrigin:'0 0',transition:dragging?'none':'transform .1s'}}>
                    <img src={planta} alt="Planta" style={{width:'100%',display:'block',maxHeight:520,objectFit:'contain',userSelect:'none',pointerEvents:'none'}}/>
                  </div>
                : <div style={{height:440,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#CCC',gap:8,pointerEvents:'none'}}>
                    <div style={{fontSize:32}}>🗺️</div>
                    <div style={{fontSize:12}}>{plantaObj?.loading?'Carregando planta...':'Clique para adicionar planta'}</div>
                  </div>
              }
              {/* Ícones dos registros — sempre visíveis independente da planta */}
              {regsAtivos.map(reg=>(
                <CameraIcon key={reg.id} reg={reg}
                  onClick={e=>{e.stopPropagation();setIconClicked(reg.id);}}
                  style={{
                    left:`calc(${reg.x}% * ${zoom} + ${pan.x}px - 14px)`,
                    top:`calc(${reg.y}% * ${zoom} + ${pan.y}px - 14px)`,
                    width:28,height:28,background:getColor(reg.atividade),
                    borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:13,boxShadow:'0 2px 10px rgba(0,0,0,.45)',
                    border:'2.5px solid rgba(255,255,255,.7)',zIndex:20,
                    transition:dragging?'none':'left .1s,top .1s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div style={{padding:'5px 14px',fontSize:10,color:'#BBB'}}>
          {planta?`${regsAtivos.length} registro(s) · Clique para adicionar`:''}
        </div>
      </div>

      {modal&&<MiniGuia x={modal.x} y={modal.y} pavAtivo={pavAtivo} juntas={juntas} atividades={atividades} plantaNome={plantaNome} plantaUpdatedAt={plantaUpdatedAt} onSaveJunta={onSaveJunta} onDeleteJunta={onDeleteJunta} onSaveAtividade={onSaveAtividade} onDeleteAtividade={onDeleteAtividade} registros={registros} empId={empId} onClose={closeAll} onSave={async d=>{await onSaveRegistro({...d,x:modal.x,y:modal.y,pavimento:pavAtivo});closeAll();}}/>}
      {iconClicked!==null&&<MiniGuia existing={registros.find(r=>r.id===iconClicked)} pavAtivo={pavAtivo} juntas={juntas} atividades={atividades} plantaNome={plantaNome} plantaUpdatedAt={plantaUpdatedAt} onSaveJunta={onSaveJunta} onDeleteJunta={onDeleteJunta} onSaveAtividade={onSaveAtividade} onDeleteAtividade={onDeleteAtividade} registros={registros} empId={empId} onClose={closeAll} onSave={async d=>{await onSaveRegistro({...registros.find(r=>r.id===iconClicked),...d});closeAll();}} onDelete={async()=>{await onDeleteRegistro(iconClicked);closeAll();}}/>}
    </div>
  )
}
