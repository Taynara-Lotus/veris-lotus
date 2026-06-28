const GOLD='#68541F',BEIGE='#CDC9B8',JET='#1A1A18',WHITE='#FFFFFF',OFF='#F7F5F0'

const DISCIPLINAS=[
  {cod:'ARQ',nome:'Arquitetura'},{cod:'EST',nome:'Estrutura'},
  {cod:'HID',nome:'Hidráulica'},{cod:'ELE',nome:'Elétrica'},
  {cod:'AR',nome:'Ar Condicionado'},{cod:'IMP',nome:'Impermeabilização'},
  {cod:'PAI',nome:'Paisagismo'},{cod:'INT',nome:'Interiores'},
]

import { useState } from 'react'

export default function Vista3D({registros,pavimentos,atividades}){
  const[hover,setHover]=useState(null)

  const isDone=(pav,disc)=>registros.some(r=>
    r.pavimento?.toLowerCase().includes(pav.toLowerCase())&&
    (r.atividade?.toLowerCase().includes(disc.nome.toLowerCase())||r.atividade?.toLowerCase().includes(disc.cod.toLowerCase()))
  )

  const W=80,H=32,D=22,cols=5,rows=3,ox=360,oy=80
  const pavs=[...pavimentos].slice(0,16)
  const levels=pavs.length
  const iso=(c,ro,lv)=>({x:ox+(c-ro)*(W/2),y:oy+(c+ro)*(H/2)-lv*D})
  const pts=arr=>arr.map(([x,y])=>`${x},${y}`).join(' ')

  return(
    <div>
      <h2 style={{color:GOLD,marginTop:0,fontWeight:300,letterSpacing:1}}>Vista 3D — Andamento da Obra</h2>

      <div style={{display:'flex',gap:20,marginBottom:14}}>
        {[['Concluído',GOLD],['Pendente',BEIGE]].map(([l,c])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#888'}}>
            <div style={{width:14,height:14,background:c,borderRadius:3,border:c===BEIGE?'1px solid #bbb':'none'}}/>{l}
          </div>
        ))}
      </div>

      <div style={{background:JET,borderRadius:14,overflow:'auto',marginBottom:24,padding:10}}>
        <svg width="800" height={Math.min(levels*D+220,560)} viewBox={`0 0 800 ${Math.min(levels*D+220,560)}`} style={{maxWidth:'100%',display:'block'}}>
          {[...Array(levels)].map((_,i)=>levels-1-i).map(lv=>(
            [...Array(rows)].map((_,row)=>
              [...Array(cols)].map((_,col)=>{
                const pav=pavs[lv]
                const done=registros.some(r=>r.pavimento?.toLowerCase().includes(pav?.toLowerCase()||''))
                const p=iso(col,row,lv)
                const hov=hover?.pav===pav&&hover?.col===col&&hover?.row===row
                const fill=done?GOLD:BEIGE
                return(
                  <g key={`${lv}-${col}-${row}`}
                    onMouseEnter={()=>setHover({pav,col,row})}
                    onMouseLeave={()=>setHover(null)}
                    style={{cursor:'pointer'}}>
                    <polygon points={pts([[p.x,p.y],[p.x+W/2,p.y+H/2],[p.x+W/2,p.y+H/2+D],[p.x,p.y+D]])} fill={done?'#3A2810':'#A8A498'} stroke="#1A1A18" strokeWidth={.4}/>
                    <polygon points={pts([[p.x+W/2,p.y+H/2],[p.x+W,p.y],[p.x+W,p.y+D],[p.x+W/2,p.y+H/2+D]])} fill={done?'#4A3415':'#B8B4A0'} stroke="#1A1A18" strokeWidth={.4}/>
                    <polygon points={pts([[p.x,p.y],[p.x+W/2,p.y-H/2],[p.x+W,p.y],[p.x+W/2,p.y+H/2]])} fill={hov?(done?'#8B6F2E':'#E0DDD0'):fill} stroke="#1A1A18" strokeWidth={.4} opacity={hov?.9:1}/>
                    {hov&&col===2&&row===1&&pav&&<text x={p.x+W/2} y={p.y-H/2-6} textAnchor="middle" fontSize="9" fill={BEIGE} fontWeight="700">{pav}</text>}
                  </g>
                )
              })
            )
          ))}
        </svg>
      </div>

      {hover?.pav&&(
        <div style={{background:WHITE,border:`1px solid ${BEIGE}`,borderRadius:10,padding:16,marginBottom:20}}>
          <div style={{fontWeight:700,color:GOLD,marginBottom:10,letterSpacing:.5}}>{hover.pav}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:6}}>
            {DISCIPLINAS.map(disc=>{
              const done=isDone(hover.pav,disc)
              return(
                <div key={disc.cod} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:done?GOLD:BEIGE,border:done?'none':'1px solid #bbb',flexShrink:0}}/>
                  <span style={{color:done?GOLD:'#AAA'}}><b>{disc.cod}</b> · {disc.nome}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead>
            <tr style={{background:JET,color:WHITE}}>
              <th style={{padding:'9px 12px',textAlign:'left',fontWeight:600,letterSpacing:.5}}>Pavimento</th>
              {DISCIPLINAS.map(d=><th key={d.cod} style={{padding:'7px 8px',textAlign:'center',fontWeight:600}} title={d.nome}>{d.cod}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...pavimentos].reverse().map((pav,pi)=>(
              <tr key={pav} style={{background:pi%2?OFF:WHITE}}>
                <td style={{padding:'7px 12px',fontWeight:600,color:GOLD,whiteSpace:'nowrap'}}>{pav}</td>
                {DISCIPLINAS.map(disc=>{
                  const done=isDone(pav,disc)
                  return(
                    <td key={disc.cod} style={{textAlign:'center',padding:5}}>
                      <div title={done?'Concluído':'Pendente'} style={{width:18,height:18,borderRadius:4,margin:'0 auto',background:done?GOLD:BEIGE,border:done?'none':'1px solid #CCC'}}/>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
