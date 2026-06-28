import { useState, useEffect } from 'react'

const GOLD='#68541F', BEIGE='#CDC9B8', JET='#1A1A18', JET2='#2C2C28', JET3='#3E3E38', WHITE='#FFFFFF'

function LotusLogo({ size=28, color=WHITE }) {
  return (
    <svg height={size} width={size*3.6} viewBox="0 0 216 60" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      <text x="2" y="54" fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif"
        fontWeight="900" fontSize="60" fill={color} letterSpacing="-1">Lotus</text>
      <rect x="2" y="55" width="46" height="5" fill={color}/>
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)

  const TABS = ['Dados da Obra', 'Registros para Certificação', 'Gestão de Registros', 'Vista 3D']

  return (
    <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",background:'#F7F5F0',minHeight:'100vh',color:JET}}>
      {/* HEADER */}
      <div style={{background:JET,color:WHITE,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${JET3}`,height:56,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <LotusLogo size={28} color={WHITE}/>
          <div style={{width:1,height:28,background:JET3}}/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:BEIGE,letterSpacing:.8}}>Artefacto por Lotus</div>
            <div style={{fontSize:10,color:'#666',letterSpacing:1,textTransform:'uppercase'}}>VĒRIS · Certification Platform</div>
          </div>
        </div>
        <div style={{fontSize:10,color:GOLD,letterSpacing:1}}>EDGE · Certificação</div>
      </div>

      {/* TABS */}
      <div style={{display:'flex',background:JET2,borderBottom:`1px solid ${JET3}`,overflowX:'auto',position:'sticky',top:56,zIndex:99}}>
        {TABS.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            padding:'12px 22px',border:'none',background:'transparent',
            color:tab===i?BEIGE:'#666',fontWeight:tab===i?700:400,fontSize:11,
            cursor:'pointer',letterSpacing:.8,textTransform:'uppercase',
            borderBottom:tab===i?`2px solid ${GOLD}`:'2px solid transparent',
            whiteSpace:'nowrap',transition:'all .2s',
          }}>{t}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{padding:20,maxWidth:1100,margin:'0 auto'}}>
        {tab===0 && (
          <div style={{textAlign:'center',padding:60,color:GOLD}}>
            <div style={{fontSize:32,marginBottom:8}}>📋</div>
            <div style={{fontSize:16,fontWeight:300,letterSpacing:1}}>Dados da Obra</div>
            <div style={{fontSize:12,color:'#999',marginTop:8}}>Em breve — conectando ao Supabase</div>
          </div>
        )}
        {tab===1 && (
          <div style={{textAlign:'center',padding:60,color:GOLD}}>
            <div style={{fontSize:32,marginBottom:8}}>🗺️</div>
            <div style={{fontSize:16,fontWeight:300,letterSpacing:1}}>Registros para Certificação</div>
            <div style={{fontSize:12,color:'#999',marginTop:8}}>Em breve</div>
          </div>
        )}
        {tab===2 && (
          <div style={{textAlign:'center',padding:60,color:GOLD}}>
            <div style={{fontSize:32,marginBottom:8}}>📊</div>
            <div style={{fontSize:16,fontWeight:300,letterSpacing:1}}>Gestão de Registros</div>
            <div style={{fontSize:12,color:'#999',marginTop:8}}>Em breve</div>
          </div>
        )}
        {tab===3 && (
          <div style={{textAlign:'center',padding:60,color:GOLD}}>
            <div style={{fontSize:32,marginBottom:8}}>🏗️</div>
            <div style={{fontSize:16,fontWeight:300,letterSpacing:1}}>Vista 3D</div>
            <div style={{fontSize:12,color:'#999',marginTop:8}}>Em breve</div>
          </div>
        )}
      </div>
    </div>
  )
}
