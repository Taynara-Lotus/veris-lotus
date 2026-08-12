import { useMemo, useState, useRef, Fragment } from 'react'
import { ESTRATEGIA_STATUS } from './EstrategiasCertificacao'

const GOLD='#68541F',GOLD2='#8B6F2E',BEIGE='#CDC9B8',BEIGE2='#EDE8DF'
const JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'
const PF="'Playfair Display',Georgia,serif", IN="Inter,-apple-system,sans-serif"

// Paleta pastel/terrosa para categorias de premissas (coerente com a identidade do app)
const CATEGORY_FIXED = { energia:'#D9B23C', água:'#6E8FA3', agua:'#6E8FA3' }
const CATEGORY_PALETTE = ['#8FA391','#C1876B','#A78BA0','#B98B6B','#7E8B99','#C08D95','#A08D5D','#6E8A7C','#B4A16C','#8A7B95']
function getCategoryColor(name){
  const key = (name||'sem categoria').toLowerCase().trim()
  if (CATEGORY_FIXED[key]) return CATEGORY_FIXED[key]
  let hash = 0
  for (let i=0;i<key.length;i++) hash = key.charCodeAt(i) + ((hash<<5)-hash)
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length]
}

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

function Panel({title, action, children}){
  return (
    <div style={{background:WHITE,border:`1px solid ${BEIGE2}`,borderRadius:10,padding:18,boxShadow:'0 2px 8px -3px rgba(22,20,15,.06)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div style={{fontSize:11,color:'#999',letterSpacing:.8,textTransform:'uppercase',fontFamily:IN}}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({children}){
  return <div style={{textAlign:'center',color:'#BBB',fontSize:13,padding:'30px 0',fontFamily:IN}}>{children}</div>
}

// ── Anel de progresso: segmentos arredondados com espaçamento (estilo gauge) ──
function polarToXY(cx,cy,r,angleDeg){
  const rad = angleDeg*Math.PI/180
  return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) }
}
function describeArc(cx,cy,r,startAngle,endAngle){
  const start = polarToXY(cx,cy,r,startAngle)
  const end = polarToXY(cx,cy,r,endAngle)
  const largeArcFlag = (endAngle-startAngle) <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function ProgressRing({segments, size=176, strokeWidth=17, gapDeg=5, centerLabel, centerSub}){
  const total = segments.reduce((s,x)=>s+x.value,0) || 1
  const r = (size-strokeWidth)/2
  const cx = size/2, cy = size/2
  let acc = -90
  const arcs = segments.filter(s=>s.value>0).map(s => {
    const angle = (s.value/total)*360
    const startAngle = acc + (angle < gapDeg*1.5 ? angle*0.12 : gapDeg/2)
    const endAngle = acc + angle - (angle < gapDeg*1.5 ? angle*0.12 : gapDeg/2)
    acc += angle
    return { ...s, startAngle, endAngle }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={OFF} strokeWidth={strokeWidth}/>
      {arcs.map((a,i) => (
        <path key={i} d={describeArc(cx,cy,r,a.startAngle,a.endAngle)} fill="none"
          stroke={a.color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      ))}
      <text x="50%" y="45%" textAnchor="middle" fontFamily={PF} fontSize={size*0.205} fill={JET} fontWeight={700}>{centerLabel}</text>
      <text x="50%" y="60%" textAnchor="middle" fontFamily={IN} fontSize={size*0.062} fill="#A6A093" letterSpacing={1.2}>{centerSub}</text>
    </svg>
  )
}

// ── Anéis concêntricos: um anel por categoria (estilo gauge/OKR) ───
function MultiRingChart({segments, size=170, strokeWidth=13, gap=7}){
  const cx = size/2, cy = size/2
  const maxR = size/2 - strokeWidth/2 - 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',flexShrink:0}}>
      {segments.map((s,i) => {
        const r = maxR - i*(strokeWidth+gap)
        if (r <= strokeWidth/2) return null
        const c = 2*Math.PI*r
        const pct = Math.max(0, Math.min(100, s.pct))
        const dash = (pct/100)*c
        return (
          <g key={s.key}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={OFF} strokeWidth={strokeWidth}/>
            {dash>0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}/>}
          </g>
        )
      })}
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

// Barra empilhada horizontal (ex: com pendência x regularizado)
function StackedBar({label, segments, total}){
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11.5,color:JET,marginBottom:4,fontFamily:IN}}>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'70%'}}>{label}</span>
        <span style={{color:'#999',fontWeight:600}}>{total}</span>
      </div>
      <div style={{height:10,borderRadius:5,background:OFF,overflow:'hidden',display:'flex'}}>
        {segments.map((s,i)=> s.value>0 && (
          <div key={i} title={`${s.name}: ${s.value}`} style={{height:'100%',width:`${(s.value/(total||1))*100}%`,background:s.color,transition:'width .3s'}}/>
        ))}
      </div>
    </div>
  )
}

// ── Gráfico de área suave (evolução no tempo) ──────────────────────
function smoothPath(points){
  if(points.length<2) return `M ${points[0]?.x||0} ${points[0]?.y||0}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i=0;i<points.length-1;i++){
    const p0=points[i], p1=points[i+1]
    const midX = (p0.x+p1.x)/2
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

// ── Gráfico de linha/área com tooltip interativo ao passar o mouse ─
function EvolucaoChart({data, width=680, height=220}){
  const [hover, setHover] = useState(null) // índice do ponto sob o mouse
  const svgRef = useRef(null)

  const padL=8, padR=8, padT=18, padB=26
  const innerW = width-padL-padR, innerH = height-padT-padB
  const maxVal = Math.max(1, ...data.map(d=>d.criadas))
  const toXY = (i, val) => ({
    x: padL + (data.length<=1 ? innerW/2 : (i/(data.length-1))*innerW),
    y: padT + innerH - (val/maxVal)*innerH
  })
  const criadasPts = data.map((d,i)=>toXY(i,d.criadas))
  const concluidasPts = data.map((d,i)=>toXY(i,d.concluidas))
  const areaPath = smoothPath(concluidasPts) + ` L ${concluidasPts[concluidasPts.length-1].x} ${padT+innerH} L ${concluidasPts[0].x} ${padT+innerH} Z`

  const fmtShort = (d) => d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * width
    let closest = 0, minDist = Infinity
    criadasPts.forEach((p,i)=>{ const d = Math.abs(p.x-relX); if (d<minDist){ minDist=d; closest=i } })
    setHover(closest)
  }

  const h = hover!=null ? data[hover] : null
  const hCriPt = hover!=null ? criadasPts[hover] : null
  const hConPt = hover!=null ? concluidasPts[hover] : null

  return (
    <div style={{position:'relative', width:'100%'}}>
      <div style={{width:'100%', aspectRatio:`${width} / ${height}`}}>
        <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}
          style={{display:'block',cursor:'crosshair'}}
          onMouseMove={handleMove} onMouseLeave={()=>setHover(null)}>
          <defs>
            <linearGradient id="evoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8A9A5B" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#8A9A5B" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* linhas guia horizontais */}
          {[0.25,0.5,0.75,1].map((f,i)=>(
            <line key={i} x1={padL} x2={width-padR} y1={padT+innerH*(1-f)} y2={padT+innerH*(1-f)} stroke={BEIGE2} strokeWidth={1}/>
          ))}
          <path d={areaPath} fill="url(#evoGrad)"/>
          <path d={smoothPath(criadasPts)} fill="none" stroke={BEIGE} strokeWidth={2} strokeDasharray="4 4"/>
          <path d={smoothPath(concluidasPts)} fill="none" stroke="#8A9A5B" strokeWidth={2.5}/>
          {hCriPt && hConPt && <>
            <line x1={hCriPt.x} x2={hCriPt.x} y1={padT} y2={padT+innerH} stroke={GOLD2} strokeWidth={1} strokeDasharray="2 3" opacity={0.6}/>
            <circle cx={hCriPt.x} cy={hCriPt.y} r={3.5} fill={BEIGE} stroke={WHITE} strokeWidth={1.5}/>
            <circle cx={hConPt.x} cy={hConPt.y} r={4} fill="#8A9A5B" stroke={WHITE} strokeWidth={1.5}/>
          </>}
          {/* eixo x: primeira e última data */}
          <text x={padL} y={height-6} fontFamily={IN} fontSize={9.5} fill="#AAA">{fmtShort(data[0].date)}</text>
          <text x={width-padR} y={height-6} textAnchor="end" fontFamily={IN} fontSize={9.5} fill="#AAA">{fmtShort(data[data.length-1].date)}</text>
        </svg>
      </div>
      {h && (
        <div style={{
          position:'absolute', pointerEvents:'none',
          left:`${(hConPt.x/width)*100}%`, top:`${(hConPt.y/height)*100}%`,
          transform:'translate(-50%,-125%)',
          background:JET, color:WHITE, borderRadius:6, padding:'5px 9px',
          fontSize:10.5, fontFamily:IN, whiteSpace:'nowrap', boxShadow:'0 4px 14px rgba(0,0,0,.25)'
        }}>
          <span style={{color:'#B99A54',marginRight:6}}>{fmtShort(h.date)}</span>
          <span style={{fontWeight:700}}>{h.concluidas} concluídas</span>
          <span style={{color:'#999',marginLeft:6}}>· {h.criadas} criadas</span>
        </div>
      )}
    </div>
  )
}

// ── Matriz de status por categoria ao longo dos meses (heatmap) ────
const HEATMAP_STATUSES = ['concluido','consultoria','andamento','pendente','nao_iniciado']

function CategoriaStatusHeatmap({estrategias, statusList}){
  const [hover, setHover] = useState(null) // {cat, monthIdx, x, y}

  const meses = useMemo(()=>{
    if (estrategias.length===0) return []
    const datas = estrategias.map(e=>new Date(e.created_at)).filter(d=>!isNaN(d))
    if (datas.length===0) return []
    const minDate = new Date(Math.min(...datas))
    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    const now = new Date()
    const list = []
    let cursor = new Date(start)
    while (cursor <= now){
      list.push(new Date(cursor))
      cursor = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1)
    }
    if (list.length===0) list.push(now)
    return list.slice(-6) // últimos 6 meses, para manter minimalista
  }, [estrategias])

  const categorias = useMemo(()=>{
    const map = {}
    estrategias.forEach(e=>{ const k=e.categoria||'Sem categoria'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([k])=>k).slice(0,6)
  }, [estrategias])

  const statusMap = Object.fromEntries(statusList.map(s=>[s.value,s]))

  const cellData = (cat, monthDate) => {
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 0, 23,59,59)
    const items = estrategias.filter(e => (e.categoria||'Sem categoria')===cat && new Date(e.created_at) <= monthEnd)
    const counts = {}
    HEATMAP_STATUSES.forEach(s=>counts[s]=0)
    items.forEach(e => { if (counts[e.status]!==undefined) counts[e.status]++ })
    return { total: items.length, counts }
  }

  if (meses.length===0 || categorias.length===0) return <Empty>Sem dados suficientes para a matriz.</Empty>

  return (
    <div style={{overflowX:'auto'}}>
      <div style={{display:'grid', gridTemplateColumns:`120px repeat(${meses.length}, 1fr)`, gap:6, minWidth:meses.length*70+120}}>
        <div/>
        {meses.map((m,i)=>(
          <div key={i} style={{fontSize:10,color:'#999',textAlign:'center',fontFamily:IN,textTransform:'capitalize'}}>
            {m.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})}
          </div>
        ))}
        {categorias.map(cat => (
          <Fragment key={cat}>
            <div style={{fontSize:11.5,color:JET,fontFamily:IN,display:'flex',alignItems:'center',gap:6,paddingRight:6}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:getCategoryColor(cat),flexShrink:0}}/>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cat}</span>
            </div>
            {meses.map((m,mi) => {
              const { total, counts } = cellData(cat, m)
              return (
                <div key={mi}
                  onMouseEnter={()=>setHover({cat, monthIdx:mi, total, counts, monthLabel:m.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})})}
                  onMouseLeave={()=>setHover(null)}
                  style={{height:22, borderRadius:5, overflow:'hidden', display:'flex', background:OFF, cursor:'default',
                    outline: hover?.cat===cat && hover?.monthIdx===mi ? `1.5px solid ${GOLD2}` : 'none'}}>
                  {total>0 && HEATMAP_STATUSES.map(s => counts[s]>0 && (
                    <div key={s} style={{height:'100%', width:`${(counts[s]/total)*100}%`, background:statusMap[s]?.color||GOLD}}/>
                  ))}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
      {/* legenda */}
      <div style={{display:'flex',gap:14,flexWrap:'wrap',marginTop:12,fontFamily:IN,fontSize:10.5,color:'#888'}}>
        {HEATMAP_STATUSES.map(s=>(
          <span key={s} style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:9,height:9,borderRadius:2,background:statusMap[s]?.color,display:'inline-block'}}/>
            {statusMap[s]?.label}
          </span>
        ))}
      </div>
      {/* tooltip */}
      {hover && (
        <div style={{marginTop:10, background:JET, color:WHITE, borderRadius:8, padding:'10px 14px', fontFamily:IN, fontSize:11.5, display:'inline-block'}}>
          <div style={{color:'#B99A54', fontSize:10, marginBottom:4, textTransform:'capitalize'}}>{hover.cat} · {hover.monthLabel}</div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {HEATMAP_STATUSES.map(s=> hover.counts[s]>0 && (
              <span key={s} style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:statusMap[s]?.color,display:'inline-block'}}/>
                {statusMap[s]?.label}: <b>{hover.counts[s]}</b>
              </span>
            ))}
            {hover.total===0 && <span style={{color:'#999'}}>Nenhuma premissa cadastrada até este mês.</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({registros, atividades, estrategias, obra, isMobile=false}){
  const [categoriaView, setCategoriaView] = useState('barras') // 'barras' | 'aneis'

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

  const statusPorPavimento = useMemo(()=>{
    const map = {}
    registros.forEach(r=>{
      const k = r.pavimento||'Sem pavimento'
      if(!map[k]) map[k] = { total:0, pendente:0 }
      map[k].total++
      const temPendencia = (r.coments?.some(c=>c.status==='pendente')) ||
        (r.nfs?.some(n=>n.status==='pendente'||n.status==='validar')) ||
        (r.cats?.some(c=>c.status==='pendente'||c.status==='validar'))
      if (temPendencia) map[k].pendente++
    })
    return Object.entries(map).sort((a,b)=>b[1].total-a[1].total).slice(0,10)
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

  const evolucao = useMemo(()=>{
    if (estrategias.length===0) return []
    const datas = estrategias.map(e=>new Date(e.created_at)).filter(d=>!isNaN(d))
    if (datas.length===0) return []
    const minDate = new Date(Math.min(...datas))
    minDate.setHours(0,0,0,0)
    const now = new Date()
    const buckets = []
    let cursor = new Date(minDate)
    while (cursor <= now){
      buckets.push(new Date(cursor))
      cursor = new Date(cursor.getTime() + 7*24*3600*1000)
    }
    if (buckets.length===0 || buckets[buckets.length-1].getTime() < now.getTime()) buckets.push(now)
    return buckets.map(bucketDate=>{
      const criadas = estrategias.filter(e=>new Date(e.created_at) <= bucketDate).length
      const concluidas = estrategias.filter(e=>e.status==='concluido' && new Date(e.updated_at||e.created_at) <= bucketDate).length
      return { date: bucketDate, criadas, concluidas }
    })
  }, [estrategias])

  const maxAtiv = Math.max(1, ...porAtividade.map(([,v])=>v))
  const maxPav = Math.max(1, ...porPavimento.map(([,v])=>v))

  return (
    <div>
      <h2 style={{color:JET,margin:'0 0 18px',fontWeight:500,fontFamily:PF,fontSize:isMobile?16:18}}>Dashboard</h2>

      {/* Cards de topo */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:22}}>
        <Card label="Registros" value={totalRegistros} sub={`${totalFotos} foto(s) anexada(s)`}/>
        <Card label="Comentários Pendentes" value={comentPendentes} sub="em registros de campo" color={comentPendentes>0?'#C17F68':JET}/>
        <Card label="Documentos Pendentes" value={docsPendentes.total} sub={`${docsPendentes.nf} NF · ${docsPendentes.cat} catálogo`} color={docsPendentes.total>0?'#C9A24B':JET}/>
        <Card label="Premissas Cadastradas" value={totalEstr} sub={`${pctConcluido}% concluído/atendido`} color={GOLD}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Progresso por certificação — anel redesenhado */}
        <Panel title={`Progresso · Certificação ${obra?.certificacao||''}`}>
          {totalEstr===0
            ? <Empty>Nenhuma premissa cadastrada ainda.</Empty>
            : (
              <div style={{display:'flex',alignItems:'center',gap:22,flexWrap:'wrap'}}>
                <ProgressRing segments={statusCounts.map(s=>({key:s.key,value:s.value,color:s.color}))} centerLabel={`${pctConcluido}%`} centerSub="CONCLUÍDO"/>
                <div style={{flex:1,minWidth:160}}>
                  {statusCounts.filter(s=>s.value>0).map(s=>(
                    <div key={s.key} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,marginBottom:6,fontFamily:IN}}>
                      <div style={{width:9,height:9,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                      <span style={{color:'#555',flex:1}}>{s.label}</span>
                      <span style={{color:JET,fontWeight:700}}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </Panel>

        {/* Conclusão por categoria — toggle barras/anéis */}
        <Panel title="Conclusão por Categoria" action={
          porCategoria.length>0 && (
            <div style={{display:'flex',gap:4,background:OFF,borderRadius:6,padding:2}}>
              <button onClick={()=>setCategoriaView('barras')} style={{border:'none',cursor:'pointer',fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:5,background:categoriaView==='barras'?WHITE:'transparent',color:categoriaView==='barras'?JET:'#999',boxShadow:categoriaView==='barras'?'0 1px 3px rgba(0,0,0,.12)':'none',fontFamily:IN}}>Barras</button>
              <button onClick={()=>setCategoriaView('aneis')} style={{border:'none',cursor:'pointer',fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:5,background:categoriaView==='aneis'?WHITE:'transparent',color:categoriaView==='aneis'?JET:'#999',boxShadow:categoriaView==='aneis'?'0 1px 3px rgba(0,0,0,.12)':'none',fontFamily:IN}}>Anéis</button>
            </div>
          )
        }>
          {porCategoria.length===0
            ? <Empty>Sem categorias cadastradas.</Empty>
            : categoriaView==='barras'
              ? porCategoria.map(([cat,v])=>(
                <Bar key={cat} label={`${cat} (${v.concluido}/${v.total})`} value={v.concluido} max={v.total} color={getCategoryColor(cat)}/>
              ))
              : (
                <div style={{display:'flex',alignItems:'center',gap:22,flexWrap:'wrap'}}>
                  <MultiRingChart segments={porCategoria.slice(0,6).map(([cat,v])=>({key:cat,pct:v.total>0?Math.round((v.concluido/v.total)*100):0,color:getCategoryColor(cat)}))}/>
                  <div style={{flex:1,minWidth:150}}>
                    {porCategoria.slice(0,6).map(([cat,v])=>{
                      const pct = v.total>0 ? Math.round((v.concluido/v.total)*100) : 0
                      return (
                        <div key={cat} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,marginBottom:8,fontFamily:IN}}>
                          <div style={{width:9,height:9,borderRadius:'50%',background:getCategoryColor(cat),flexShrink:0}}/>
                          <span style={{color:'#555',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cat}</span>
                          <span style={{color:JET,fontWeight:700}}>{pct}%</span>
                        </div>
                      )
                    })}
                    {porCategoria.length>6 && <div style={{fontSize:10.5,color:'#BBB',fontFamily:IN}}>+{porCategoria.length-6} categoria(s) não exibida(s) nos anéis</div>}
                  </div>
                </div>
              )
          }
        </Panel>
      </div>

      {/* Evolução das premissas ao longo do tempo */}
      <div style={{marginBottom:16}}>
        <Panel title="Evolução das Premissas · Criadas vs. Concluídas">
          {evolucao.length < 2
            ? <Empty>Dados insuficientes para traçar a evolução (cadastre premissas em datas diferentes).</Empty>
            : <>
              <EvolucaoChart data={evolucao}/>
              <div style={{display:'flex',gap:16,marginTop:6,fontFamily:IN,fontSize:11,color:'#888'}}>
                <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:14,height:2,background:BEIGE,display:'inline-block',borderTop:`2px dashed ${BEIGE}`}}/>Criadas (acumulado)</span>
                <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:14,height:2,background:'#8A9A5B',display:'inline-block'}}/>Concluídas (acumulado)</span>
              </div>
            </>
          }
        </Panel>
      </div>

      {/* Status por categoria ao longo dos meses */}
      <div style={{marginBottom:16}}>
        <Panel title="Status das Premissas por Categoria · Últimos Meses">
          <CategoriaStatusHeatmap estrategias={estrategias} statusList={ESTRATEGIA_STATUS}/>
        </Panel>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Registros por atividade */}
        <Panel title="Registros por Atividade">
          {porAtividade.length===0
            ? <Empty>Nenhum registro criado ainda.</Empty>
            : porAtividade.map(([atv,v])=><Bar key={atv} label={atv} value={v} max={maxAtiv} color={getColor(atv)}/>)
          }
        </Panel>

        {/* Registros por pavimento */}
        <Panel title="Registros por Pavimento">
          {porPavimento.length===0
            ? <Empty>Nenhum registro criado ainda.</Empty>
            : porPavimento.map(([pav,v])=><Bar key={pav} label={pav} value={v} max={maxPav} color={GOLD2}/>)
          }
        </Panel>
      </div>

      {/* Status por pavimento (pendências) */}
      <Panel title="Status por Pavimento">
        {statusPorPavimento.length===0
          ? <Empty>Nenhum registro criado ainda.</Empty>
          : <>
            {statusPorPavimento.map(([pav,v])=>(
              <StackedBar key={pav} label={pav} total={v.total} segments={[
                { name:'Com pendência', value:v.pendente, color:'#C17F68' },
                { name:'Regularizado', value:v.total-v.pendente, color:'#8A9A5B' },
              ]}/>
            ))}
            <div style={{display:'flex',gap:16,marginTop:6,fontFamily:IN,fontSize:11,color:'#888'}}>
              <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:9,height:9,borderRadius:2,background:'#C17F68',display:'inline-block'}}/>Com pendência</span>
              <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:9,height:9,borderRadius:2,background:'#8A9A5B',display:'inline-block'}}/>Regularizado</span>
            </div>
          </>
        }
      </Panel>
    </div>
  )
}
