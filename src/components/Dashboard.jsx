import { useMemo } from 'react'
import { ESTRATEGIA_STATUS } from './EstrategiasCertificacao'

const GOLD='#68541F',GOLD2='#8B6F2E',BEIGE='#CDC9B8',BEIGE2='#EDE8DF'
const JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'
const PF="'Playfair Display',Georgia,serif", IN="Inter,-apple-system,sans-serif"

function Card({label, value, sub, color=JET, children}){
  return (
    <div style={{background:WHITE,border:`1px solid ${BEIGE2}`,borderRadius:10,padding:'16px 18px',boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)',flex:1,minWidth:150}}>
      <div style={{fontSize:10,color:'#999',letterSpacing:.8,textTransform:'uppercase',fontFamily:IN,marginBottom:6}}>{label}</div>
      <div style={{fontSize:28,fontWeight:700,color,fontFamily:PF,lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:11,color:'#AAA',marginTop:4,fontFamily:IN}}>{sub}</div>}
      {children}
    </div>
  )
}

function Donut({segments, size=132, strokeWidth=16}){
  const total = segments.reduce((s,x)=>s+x.value,0) || 1
  const r = (size-strokeWidth)/2
  const c = 2*Math.PI*r
  let acc = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BEIGE2} strokeWidth={strokeWidth}/>
      {segments.filter(s=>s.value>0).map((s,i) => {
        const frac = s.value/total
        const dash = frac*c
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${c-dash}`} strokeDashoffset={-acc}
            transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="butt"/>
        )
        acc += dash
        return el
      })}
      <text x="50%" y="47%" textAnchor="middle" fontFamily={PF} fontSize={size*0.19} fill={JET} fontWeight={700}>{Math.round((segments.find(s=>s.key==='concluido')?.value||0)/total*100)}%</text>
      <text x="50%" y="64%" textAnchor="middle" fontFamily={IN} fontSize={size*0.07} fill="#999" letterSpacing={1} textTransform="uppercase">Concluído</text>
    </svg>
  )
}

function Bar({label, value, max, color}){
  const pct = max>0 ? Math.round((value/max)*100) : 0
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11.5,color:JET,marginBottom:4,fontFamily:IN}}>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'70%'}}>{label}</span>
        <span style={{color:'#999',fontWeight:600}}>{value}</span>
      </div>
      <div style={{height:7,borderRadius:4,background:OFF,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:4,transition:'width .3s'}}/>
      </div>
    </div>
  )
}

export default function Dashboard({registros, atividades, estrategias, obra, isMobile=false}){
  const totalRegistros = registros.length
  const totalFotos = registros.reduce((s,r)=>s+(r.fotos?.length||0),0)

  const comentPendentes = useMemo(()=>
    registros.reduce((s,r)=>s + (r.coments?.filter(c=>c.status==='pendente').length||0), 0)
  , [registros])

  const docsPendentes = useMemo(()=>{
    let nf=0, cat=0
    registros.forEach(r=>{
      nf += (r.nfs?.filter(n=>n.status==='pendente'||n.status==='validar').length||0)
      cat += (r.cats?.filter(c=>c.status==='pendente'||c.status==='validar').length||0)
    })
    return { nf, cat, total: nf+cat }
  }, [registros])

  const porAtividade = useMemo(()=>{
    const map = {}
    registros.forEach(r=>{ const k=r.atividade||'Sem atividade'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8)
  }, [registros])

  const porPavimento = useMemo(()=>{
    const map = {}
    registros.forEach(r=>{ const k=r.pavimento||'Sem pavimento'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8)
  }, [registros])

  const getColor = atv => atividades.find(a=>(a.name||a)===atv)?.color || GOLD

  const totalEstr = estrategias.length
  const statusCounts = ESTRATEGIA_STATUS.map(s => ({ ...s, key:s.value, value: estrategias.filter(e=>e.status===s.value).length }))
  const concluido = statusCounts.find(s=>s.key==='concluido')?.value || 0
  const pctConcluido = totalEstr>0 ? Math.round((concluido/totalEstr)*100) : 0

  const porCategoria = useMemo(()=>{
    const map = {}
    estrategias.forEach(e=>{
      const k = e.categoria || 'Sem categoria'
      if(!map[k]) map[k] = { total:0, concluido:0 }
      map[k].total++
      if(e.status==='concluido') map[k].concluido++
    })
    return Object.entries(map).sort((a,b)=>b[1].total-a[1].total)
  }, [estrategias])

  const maxAtiv = Math.max(1, ...porAtividade.map(([,v])=>v))
  const maxPav = Math.max(1, ...porPavimento.map(([,v])=>v))

  return (
    <div>
      <h2 style={{color:JET,margin:'0 0 18px',fontWeight:500,fontFamily:PF,fontSize:isMobile?16:18}}>Dashboard</h2>

      {/* Cards de topo */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:22}}>
        <Card label="Registros" value={totalRegistros} sub={`${totalFotos} foto(s) anexada(s)`}/>
        <Card label="Comentários Pendentes" value={comentPendentes} sub="em registros de campo" color={comentPendentes>0?'#C62828':JET}/>
        <Card label="Documentos Pendentes" value={docsPendentes.total} sub={`${docsPendentes.nf} NF · ${docsPendentes.cat} catálogo`} color={docsPendentes.total>0?'#E65100':JET}/>
        <Card label="Premissas Cadastradas" value={totalEstr} sub={`${pctConcluido}% concluído/atendido`} color={GOLD}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16,marginBottom:22}}>
        {/* Progresso por certificação */}
        <div style={{background:WHITE,border:`1px solid ${BEIGE2}`,borderRadius:10,padding:18,boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)'}}>
          <div style={{fontSize:11,color:'#999',letterSpacing:.8,textTransform:'uppercase',fontFamily:IN,marginBottom:14}}>
            Progresso · Certificação {obra?.certificacao||''}
          </div>
          {totalEstr===0
            ? <div style={{textAlign:'center',color:'#BBB',fontSize:13,padding:'30px 0',fontFamily:IN}}>Nenhuma premissa cadastrada ainda.</div>
            : (
              <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
                <Donut segments={statusCounts.map(s=>({key:s.key,value:s.value,color:s.color}))}/>
                <div style={{flex:1,minWidth:160}}>
                  {statusCounts.filter(s=>s.value>0).map(s=>(
                    <div key={s.key} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,marginBottom:6,fontFamily:IN}}>
                      <div style={{width:9,height:9,borderRadius:2,background:s.color,flexShrink:0}}/>
                      <span style={{color:'#555',flex:1}}>{s.label}</span>
                      <span style={{color:JET,fontWeight:700}}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>

        {/* Progresso por categoria */}
        <div style={{background:WHITE,border:`1px solid ${BEIGE2}`,borderRadius:10,padding:18,boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)'}}>
          <div style={{fontSize:11,color:'#999',letterSpacing:.8,textTransform:'uppercase',fontFamily:IN,marginBottom:14}}>Conclusão por Categoria</div>
          {porCategoria.length===0
            ? <div style={{textAlign:'center',color:'#BBB',fontSize:13,padding:'30px 0',fontFamily:IN}}>Sem categorias cadastradas.</div>
            : porCategoria.map(([cat,v])=>(
              <Bar key={cat} label={`${cat} (${v.concluido}/${v.total})`} value={v.concluido} max={v.total} color={GOLD}/>
            ))
          }
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
        {/* Registros por atividade */}
        <div style={{background:WHITE,border:`1px solid ${BEIGE2}`,borderRadius:10,padding:18,boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)'}}>
          <div style={{fontSize:11,color:'#999',letterSpacing:.8,textTransform:'uppercase',fontFamily:IN,marginBottom:14}}>Registros por Atividade</div>
          {porAtividade.length===0
            ? <div style={{textAlign:'center',color:'#BBB',fontSize:13,padding:'30px 0',fontFamily:IN}}>Nenhum registro criado ainda.</div>
            : porAtividade.map(([atv,v])=><Bar key={atv} label={atv} value={v} max={maxAtiv} color={getColor(atv)}/>)
          }
        </div>

        {/* Registros por pavimento */}
        <div style={{background:WHITE,border:`1px solid ${BEIGE2}`,borderRadius:10,padding:18,boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)'}}>
          <div style={{fontSize:11,color:'#999',letterSpacing:.8,textTransform:'uppercase',fontFamily:IN,marginBottom:14}}>Registros por Pavimento</div>
          {porPavimento.length===0
            ? <div style={{textAlign:'center',color:'#BBB',fontSize:13,padding:'30px 0',fontFamily:IN}}>Nenhum registro criado ainda.</div>
            : porPavimento.map(([pav,v])=><Bar key={pav} label={pav} value={v} max={maxPav} color={GOLD2}/>)
          }
        </div>
      </div>
    </div>
  )
}
