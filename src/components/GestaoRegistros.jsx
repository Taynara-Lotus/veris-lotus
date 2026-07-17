import { useState } from 'react'

const GOLD='#68541F',BEIGE='#CDC9B8',JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'

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

function fmt(d){ return d?new Date(d).toLocaleDateString('pt-BR'):'' }

function statusBadge(status, opts){
  const s=opts.find(x=>x.value===status)
  if(!s) return null
  return <span style={{display:'inline-block',padding:'2px 8px',borderRadius:10,background:s.color+'22',color:s.color,fontSize:10,fontWeight:700,letterSpacing:.4,border:`1px solid ${s.color}44`}}>{s.label}</span>
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

function DocStatusSummary({items, label}){
  if(!items||!items.length) return null
  return(
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:5}}>{label} ({items.length})</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
        {STATUS_DOC.map(s=>{
          const n=items.filter(i=>i.status===s.value).length
          if(!n) return null
          return <span key={s.value} style={{fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:10,background:s.color+'22',color:s.color,border:`1px solid ${s.color}44`}}>{s.label}: {n}</span>
        })}
      </div>
      {items.map((it,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,marginTop:3,paddingLeft:4}}>
          <span style={{color:'#888'}}>📎 {it.nomeArq||it.nome||'—'}</span>
          {statusBadge(it.status, STATUS_DOC)}
        </div>
      ))}
    </div>
  )
}

// ── Exportar PDF completo com fotos e todos os dados ─────────────
function exportPDF(registros, atividades) {
  const getColor = atv => atividades.find(a=>(a.name||a)===atv)?.color||GOLD
  
  const STATUS_COLORS = { concluido:'#2E7D32', pendente:'#C62828', a_iniciar:'#E65100' }
  const STATUS_LABELS = { concluido:'Concluído', pendente:'Pendente', a_iniciar:'A iniciar' }
  const DOC_STATUS_LABELS = { pendente:'Pendente', validar:'Validar', validado:'Validado', nao_se_aplica:'Não se aplica' }

  const cards = registros.map(r => {
    const pendentes = r.coments?.filter(c=>c.status==='pendente').length||0
    const cor = getColor(r.atividade)
    
    const fotosHtml = r.fotos?.length > 0 ? `
      <div style="margin:8px 0">
        <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Fotos (${r.fotos.length})</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${r.fotos.map(f=>`<img src="${f.url||f.data||''}" style="width:120px;height:90px;object-fit:cover;border-radius:4px;border:1px solid #ddd"/>`).join('')}
        </div>
      </div>` : ''

    const nfsHtml = r.nfs?.length > 0 ? `
      <div style="margin:8px 0">
        <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Notas Fiscais (${r.nfs.length})</div>
        ${r.nfs.map(n=>`<div style="font-size:11px;margin:2px 0">📎 ${n.nomeArq||n.nome||'—'} <span style="font-size:10px;color:#888">${DOC_STATUS_LABELS[n.status]||''}</span></div>`).join('')}
      </div>` : ''

    const catsHtml = r.cats?.length > 0 ? `
      <div style="margin:8px 0">
        <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Catálogos Técnicos (${r.cats.length})</div>
        ${r.cats.map(c=>`<div style="font-size:11px;margin:2px 0">📎 ${c.nomeArq||c.nome||'—'} <span style="font-size:10px;color:#888">${DOC_STATUS_LABELS[c.status]||''}</span></div>`).join('')}
      </div>` : ''

    const comentsHtml = r.coments?.length > 0 ? `
      <div style="margin:8px 0">
        <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Comentários (${r.coments.length})</div>
        ${r.coments.map(c=>`
          <div style="border-left:3px solid ${STATUS_COLORS[c.status]||'#ccc'};padding:4px 8px;margin:4px 0;background:#fafafa;font-size:11px">
            <span style="color:${STATUS_COLORS[c.status]};font-weight:700">${STATUS_LABELS[c.status]||''}</span>
            ${c.usuario?`<span style="color:#666;margin-left:8px">👤 ${c.usuario}</span>`:''}
            <span style="color:#aaa;margin-left:8px">${c.data||''}</span>
            ${c.descricao?`<div style="color:#333;margin-top:3px">${c.descricao}</div>`:''}
          </div>`).join('')}
      </div>` : ''

    return `
    <div style="border:1px solid #e0d8c8;border-radius:8px;padding:16px;margin-bottom:20px;page-break-inside:avoid">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;border-bottom:1px solid #f0e8d8;padding-bottom:10px">
        <div style="width:28px;height:28px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">📷</div>
        <div style="font-weight:700;color:#68541F;font-size:15px">${r.serial||'—'}</div>
        <div style="font-size:13px;color:#1A1A18;font-weight:500">${r.atividade||'—'}</div>
        ${pendentes>0?`<span style="background:#C62828;color:white;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700">⚠ ${pendentes} pendente${pendentes>1?'s':''}</span>`:''}
        <div style="margin-left:auto;font-size:11px;color:#aaa">${r.horario||''}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;font-size:12px">
        ${[['Pavimento',r.pavimento],['Junta',r.junta],['Responsável',r.responsavel],['Atividade',r.atividade]].map(([k,v])=>v?`<div><span style="color:#aaa;font-size:10px;text-transform:uppercase;letter-spacing:.5px">${k}</span><br><span style="color:#1A1A18">${v}</span></div>`:'').join('')}
        ${r.geo_lat?`<div><span style="color:#aaa;font-size:10px;text-transform:uppercase">WGS84</span><br><span>${r.geo_lat}, ${r.geo_lng}</span></div>`:''}
        ${r.utm_zone?`<div><span style="color:#aaa;font-size:10px;text-transform:uppercase">UTM</span><br><span>Zona ${r.utm_zone} E${r.utm_e}/N${r.utm_n}</span></div>`:''}
      </div>
      ${fotosHtml}${nfsHtml}${catsHtml}${comentsHtml}
    </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Relatório VĒRIS</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1A1A18; padding: 32px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: 300; letter-spacing: 2px; color: #68541F; margin-bottom: 4px; }
  .sub { font-size: 11px; color: #aaa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 28px; }
  .footer { margin-top: 32px; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
  @media print { body { padding: 16px; } }
</style>
</head><body>
<h1>VĒRIS · Relatório de Registros</h1>
<div class="sub">Gerado em ${new Date().toLocaleString('pt-BR')} · ${registros.length} registro(s)</div>
${cards}
<div class="footer">VĒRIS by Lotus · Plataforma de Certificação · Relatório gerado automaticamente</div>
</body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 800)
}

// ── Exportar Excel (CSV compatível com Excel) ─────────────────────
function exportExcel(registros) {
  const BOM = '\uFEFF'
  const header = ['Nº Série','Atividade','Pavimento','Junta','Responsável','Data/Hora','Fotos','NFs','Catálogos','Coment. Pendentes','UTM Zona','UTM E','UTM N','Drive'].join(';')
  const rows = registros.map(r => [
    r.serial||'',
    r.atividade||'',
    r.pavimento||'',
    r.junta||'',
    r.responsavel||'',
    r.horario||'',
    r.fotos?.length||0,
    r.nfs?.map(n=>n.nomeArq||n.nome||'').filter(Boolean).join(' | ')||'',
    r.cats?.map(c=>c.nomeArq||c.nome||'').filter(Boolean).join(' | ')||'',
    r.coments?.filter(c=>c.status==='pendente').length||0,
    r.utm_zone||'',
    r.utm_e||'',
    r.utm_n||'',
    r.drive||''
  ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';'))

  const csv = BOM + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `veris_registros_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function GestaoRegistros({registros,atividades,onDeleteRegistro,onResetSerial,isMobile}){
  const[open,setOpen]=useState(null)
  const[search,setSearch]=useState('')
  const[confirmDel,setConfirmDel]=useState(null)
  const[confirmReset,setConfirmReset]=useState(false)
  const[resetDone,setResetDone]=useState(false)
  const[exportMenu,setExportMenu]=useState(false)

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
    const a=document.createElement('a');a.href=data;a.download=name;a.click()
  }

  return(
    <div>
      {/* Barra superior */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{color:'#16140f',margin:0,fontWeight:500,fontFamily:"'Playfair Display',serif",fontSize:18,letterSpacing:.02}}>Gestão de Registros</h2>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{fontSize:13,color:'#888'}}>{registros.length} registro(s)</div>

          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..."
            style={{border:`1px solid ${BEIGE}`,borderRadius:6,padding:'7px 12px',fontSize:13,outline:'none',width:180}}/>

          {/* ── Botão Exportar ── */}
          <div style={{position:'relative'}}>
            <button onClick={()=>setExportMenu(!exportMenu)}
              style={{background:'#16140f',border:'none',color:'#faf8f3',borderRadius:4,padding:'7px 14px',fontSize:9,fontWeight:600,cursor:'pointer',letterSpacing:'.12em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:6,fontFamily:"Inter,sans-serif"}}>
              ⬇ Exportar {exportMenu?'▲':'▼'}
            </button>
            {exportMenu && (
              <div style={{position:'absolute',top:'110%',right:0,background:WHITE,border:`1px solid ${BEIGE}`,borderRadius:6,boxShadow:'0 4px 20px rgba(0,0,0,.12)',zIndex:50,minWidth:180,overflow:'hidden'}}>
                <button onClick={()=>{exportPDF(filtered,atividades);setExportMenu(false)}}
                  style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'12px 16px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,color:JET,textAlign:'left',borderBottom:`1px solid ${BEIGE}`}}
                  onMouseEnter={e=>e.currentTarget.style.background=OFF}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  📄 <div><div style={{fontWeight:600}}>PDF</div><div style={{fontSize:10,color:'#aaa'}}>Abre para imprimir / salvar</div></div>
                </button>
                <button onClick={()=>{exportExcel(filtered);setExportMenu(false)}}
                  style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'12px 16px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,color:JET,textAlign:'left'}}
                  onMouseEnter={e=>e.currentTarget.style.background=OFF}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  📊 <div><div style={{fontWeight:600}}>Excel / CSV</div><div style={{fontSize:10,color:'#aaa'}}>Baixa arquivo .csv</div></div>
                </button>
              </div>
            )}
          </div>

          {/* Zerar série */}
          <button onClick={()=>setConfirmReset(true)}
            style={{background:'transparent',border:'1.5px solid #C0392B',color:'#C0392B',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',letterSpacing:.3}}>
            {resetDone?'✅ Zerado':'🔄 Reiniciar série'}
          </button>
        </div>
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:'center',padding:60,color:'#BBB',fontSize:14}}>
          {registros.length===0?'Nenhum registro criado ainda.':'Nenhum resultado encontrado.'}
        </div>
      )}

      {/* Fechar menu de exportar ao clicar fora */}
      {exportMenu && <div onClick={()=>setExportMenu(false)} style={{position:'fixed',inset:0,zIndex:40}}/>}

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {filtered.map(reg=>{
          const isOpen=open===reg.id
          const cor=getColor(reg.atividade)
          const pendentes=reg.coments?.filter(c=>c.status==='pendente').length||0

          return(
            <div key={reg.id} style={{border:'1px solid #e4dfd0',borderRadius:8,overflow:'hidden',background:WHITE,boxShadow:'0 2px 12px -4px rgba(22,20,15,.08)'}}>
              {/* 4A: row minimalista com ícone lixeira */}
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 16px',
                borderBottom:'1px solid #ece7d9',background:isOpen?'#f2ede3':WHITE,
                transition:'background .12s',cursor:'pointer'}}
                onClick={()=>setOpen(isOpen?null:reg.id)}>
                {/* Círculo colorido com badge pendentes */}
                <div style={{position:'relative',flexShrink:0}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:cor}}/>
                  {pendentes>0&&(
                    <div style={{position:'absolute',top:-3,right:-3,width:11,height:11,borderRadius:'50%',
                      background:'#c0392b',border:'1.5px solid white',display:'flex',alignItems:'center',
                      justifyContent:'center',fontSize:6,fontWeight:700,color:WHITE,lineHeight:1}}>{pendentes}</div>
                  )}
                </div>
                {/* Serial + atividade */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:isMobile?10:11,color:'#16140f',fontWeight:600,
                    fontFamily:"Inter,sans-serif",whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {reg.serial||'—'} <span style={{fontWeight:400,color:'#736d5d'}}>· {reg.atividade||'—'}</span>
                  </div>
                  <div style={{fontSize:8,color:'#9a927e',marginTop:2,fontFamily:"Inter,sans-serif"}}>
                    {reg.pavimento||'—'} · {reg.horario||'—'}
                    {pendentes>0&&<span style={{color:'#c0392b'}}> · ⚠ {pendentes} pend.</span>}
                  </div>
                </div>
                {/* Ícone lixeira SVG minimalista (4A) */}
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  {isOpen && (
                    <button onClick={e=>{e.stopPropagation();setConfirmDel(reg.id)}}
                      style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5,transition:'opacity .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.opacity=1}
                      onMouseLeave={e=>e.currentTarget.style.opacity=.5}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a39c8b" strokeWidth="1.6">
                        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>
                      </svg>
                    </button>
                  )}
                  <span style={{fontSize:10,color:'#ccc'}}>{isOpen?'▲':'▼'}</span>
                </div>
              </div>

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

                  {reg.fotos?.length>0&&<div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:6}}>Fotos ({reg.fotos.length})</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {reg.fotos.map((f,i)=>(
                        <div key={i} style={{position:'relative'}}>
                          <img src={f.url||f.data||''} alt={f.nome} style={{width:100,height:75,objectFit:'cover',borderRadius:6,border:`1px solid ${BEIGE}`}}/>
                          <button onClick={()=>{ if(f.url) window.open(f.url,'_blank'); else downloadFile(f.data,f.nome||`foto_${i+1}.jpg`) }}
                            style={{position:'absolute',bottom:4,right:4,background:'rgba(0,0,0,.6)',border:'none',color:WHITE,borderRadius:4,padding:'2px 5px',fontSize:10,cursor:'pointer'}}>⬇</button>
                        </div>
                      ))}
                    </div>
                  </div>}

                  {reg.nfs?.length>0&&<DocStatusSummary items={reg.nfs} label="Notas Fiscais"/>}
                  {reg.cats?.length>0&&<DocStatusSummary items={reg.cats} label="Catálogos Técnicos"/>}

                  {reg.coments?.length>0&&<div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:'#AAA',letterSpacing:.8,textTransform:'uppercase',marginBottom:6}}>
                      Comentários ({reg.coments.length})
                      {pendentes>0&&<span style={{marginLeft:8,background:'#C62828',color:WHITE,borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:700}}>{pendentes} pend.</span>}
                    </div>
                    {reg.coments.map((c,i)=>(
                      <div key={i} style={{background:OFF,borderRadius:6,padding:'10px 12px',marginBottom:6,fontSize:12,borderLeft:`3px solid ${STATUS_COMENT.find(s=>s.value===c.status)?.color||BEIGE}`}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                          {c.status&&statusBadge(c.status,STATUS_COMENT)}
                          {c.usuario&&<span style={{color:'#666',fontWeight:600}}>👤 {c.usuario}</span>}
                          <span style={{color:'#AAA',marginLeft:'auto'}}>{fmt(c.data)}</span>
                        </div>
                        {c.responsavel&&<div style={{color:'#888',marginBottom:3,fontSize:11}}>Responsável: {c.responsavel}</div>}
                        <div style={{color:JET,lineHeight:1.5}}>{c.descricao}</div>
                      </div>
                    ))}
                  </div>}

                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
                    <button onClick={()=>setConfirmDel(reg.id)}
                      style={{background:'#C0392B',border:'none',color:WHITE,borderRadius:6,padding:'6px 16px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                      🗑️ Excluir Registro
                    </button>
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

      {confirmReset&&<Confirm
        msg="Isso irá reiniciar o contador de nº de série. Só é permitido quando não há registros no empreendimento. Confirmar?"
        onYes={()=>{
          if(onResetSerial) onResetSerial()
          setResetDone(true)
          setTimeout(()=>setResetDone(false),3000)
          setConfirmReset(false)
        }}
        onNo={()=>setConfirmReset(false)}
      />}
    </div>
  )
}
