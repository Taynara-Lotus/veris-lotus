import { useState, useRef } from 'react'
import { saveObra } from '../supabase'

const GOLD='#68541F',GOLD2='#8B6F2E',BEIGE='#CDC9B8',BEIGE2='#EDE8DF'
const JET='#1A1A18',JET2='#2C2C28',JET3='#3E3E38',WHITE='#FFFFFF'

function fmt(d){ return d?new Date(d).toLocaleDateString('pt-BR'):'' }
function addM(ds,m){
  if(!ds||!m) return ''
  const d=new Date(ds)
  d.setMonth(d.getMonth()+parseInt(m))
  return d.toISOString().slice(0,10)
}

function LotusLogo({size=28,color=WHITE}){
  return(
    <svg height={size} width={size*3.6} viewBox="0 0 216 60" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      <text x="2" y="54" fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif" fontWeight="900" fontSize="60" fill={color} letterSpacing="-1">Lotus</text>
      <rect x="2" y="55" width="46" height="5" fill={color}/>
    </svg>
  )
}

function Inp({label,value,onChange,type='text',placeholder}){
  return(
    <div style={{marginBottom:10}}>
      {label&&<label style={{fontSize:11,color:'#888',display:'block',marginBottom:3,letterSpacing:.5,textTransform:'uppercase'}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',boxSizing:'border-box',border:'1px solid #D4C9B0',borderRadius:6,padding:'7px 10px',fontSize:13,background:WHITE,outline:'none'}}/>
    </div>
  )
}

export default function DadosObra({obra,setObra}){
  const [form,setForm]=useState(obra||{
    nome:'Artefacto por Lotus',gerente:'',engenheiro:'',inicio:'',meses:'',fim_auto:'',
    coord_projetos:'',coord_sustentabilidade:'',consultoria:'',
    certificacao:'EDGE',nivel_certificacao:'',versao_certificacao:'',capa_bg:''
  })
  const [hov,setHov]=useState(false)
  const [saved,setSaved]=useState(false)
  const [saving,setSaving]=useState(false)
  const fileRef=useRef()

  const upd=(k,v)=>{
    const d={...form,[k]:v}
    if(k==='inicio'||k==='meses') d.fim_auto=addM(k==='inicio'?v:form.inicio,k==='meses'?v:form.meses)
    setForm(d)
  }

  const handleSave=async()=>{
    setSaving(true)
    const saved=await saveObra(form)
    if(saved){setObra(saved)}
    setSaving(false)
    setSaved(true)
    setTimeout(()=>setSaved(false),2000)
  }

  const handleCapaBg=(e)=>{
    const f=e.target.files[0]
    if(!f) return
    const r=new FileReader()
    r.onload=ev=>upd('capa_bg',ev.target.result)
    r.readAsDataURL(f)
  }

  return(
    <div>
      {/* CAPA */}
      <div style={{background:JET,borderRadius:14,overflow:'hidden',marginBottom:28,position:'relative',minHeight:300,display:'flex',flexDirection:'column',boxShadow:'0 8px 40px rgba(0,0,0,.35)'}}>
        {form.capa_bg&&<div style={{position:'absolute',inset:0,backgroundImage:`url(${form.capa_bg})`,backgroundSize:'cover',backgroundPosition:'center 30%',filter:'brightness(.28)'}}/>}
        <svg style={{position:'absolute',inset:0,opacity:.07}} width="100%" height="100%">
          {[...Array(14)].map((_,i)=><line key={`v${i}`} x1={`${i*7.14}%`} y1="0" x2={`${i*7.14}%`} y2="100%" stroke={BEIGE} strokeWidth=".5"/>)}
          {[...Array(9)].map((_,i)=><line key={`h${i}`} x1="0" y1={`${i*11.1}%`} x2="100%" y2={`${i*11.1}%`} stroke={BEIGE} strokeWidth=".5"/>)}
        </svg>
        <div style={{position:'relative',zIndex:2,padding:'28px 32px',flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <LotusLogo size={30} color={WHITE}/>
              <div style={{width:36,height:1,background:GOLD,marginTop:8}}/>
            </div>
            <div style={{display:'flex',alignItems:'flex-start',gap:18}}>
              <div onClick={()=>fileRef.current.click()} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{position:'relative',cursor:'pointer'}}>
                <div style={{width:38,height:38,borderRadius:'50%',border:`2px solid ${hov?GOLD2:GOLD}`,background:hov?'rgba(104,84,31,.2)':'rgba(104,84,31,.08)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
                  <span style={{fontSize:20,color:GOLD,lineHeight:1}}>+</span>
                </div>
                {hov&&<div style={{position:'absolute',right:0,top:44,background:JET2,color:BEIGE,fontSize:10,letterSpacing:.8,whiteSpace:'nowrap',padding:'4px 8px',borderRadius:5,border:`1px solid ${JET3}`}}>add imagem da capa</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:9,color:BEIGE,letterSpacing:2,textTransform:'uppercase',marginBottom:3}}>Certificação</div>
                <div style={{fontSize:20,fontWeight:800,color:GOLD,letterSpacing:3}}>{form.certificacao||'EDGE'}</div>
                {form.nivel_certificacao&&<div style={{fontSize:11,color:BEIGE}}>Nível {form.nivel_certificacao}</div>}
                {form.versao_certificacao&&<div style={{fontSize:10,color:'#888'}}>v{form.versao_certificacao}</div>}
              </div>
            </div>
          </div>
          <div>
            <div style={{fontSize:9,color:GOLD,letterSpacing:3,textTransform:'uppercase',marginBottom:5}}>Empreendimento</div>
            <div style={{fontSize:28,fontWeight:300,color:WHITE,letterSpacing:1}}>{form.nome}</div>
            <div style={{width:'100%',height:.5,background:`linear-gradient(to right,${GOLD},transparent)`,margin:'14px 0'}}/>
            <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
              {[['Gerente',form.gerente],['Engenheiro',form.engenheiro],['Início',fmt(form.inicio)],['Previsão',fmt(form.fim_auto)]].map(([k,v])=>v?(
                <div key={k}>
                  <div style={{fontSize:9,color:'#888',letterSpacing:1.5,textTransform:'uppercase'}}>{k}</div>
                  <div style={{fontSize:12,color:BEIGE,marginTop:2}}>{v}</div>
                </div>
              ):null)}
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleCapaBg}/>
      </div>

      {/* FORM */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{gridColumn:'1/-1'}}><Inp label="Nome do Empreendimento" value={form.nome} onChange={v=>upd('nome',v)}/></div>
        <Inp label="Gerente da Obra" value={form.gerente} onChange={v=>upd('gerente',v)}/>
        <Inp label="Engenheiro da Obra" value={form.engenheiro} onChange={v=>upd('engenheiro',v)}/>
        <Inp label="Início da Obra" type="date" value={form.inicio} onChange={v=>upd('inicio',v)}/>
        <div>
          <Inp label="Duração Prevista (meses)" type="number" value={form.meses} onChange={v=>upd('meses',v)}/>
          {form.fim_auto&&<div style={{fontSize:11,color:GOLD2,marginTop:-6,marginBottom:8}}>📅 Previsão: {fmt(form.fim_auto)}</div>}
        </div>
        <Inp label="Coordenação de Projetos" value={form.coord_projetos} onChange={v=>upd('coord_projetos',v)}/>
        <Inp label="Coordenação de Sustentabilidade" value={form.coord_sustentabilidade} onChange={v=>upd('coord_sustentabilidade',v)}/>
        <Inp label="Consultoria de Certificação" value={form.consultoria} onChange={v=>upd('consultoria',v)}/>
        <Inp label="Certificação" value={form.certificacao} onChange={v=>upd('certificacao',v)}/>
        <Inp label="Nível da Certificação" value={form.nivel_certificacao} onChange={v=>upd('nivel_certificacao',v)} placeholder="Ex: Certified, Advanced, Excellence"/>
        <Inp label="Versão da Certificação" value={form.versao_certificacao} onChange={v=>upd('versao_certificacao',v)} placeholder="Ex: 3.0"/>
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
        <button onClick={handleSave} disabled={saving}
          style={{width:36,height:36,borderRadius:5,border:'1px solid #e4dfd0',
            background:saved?'#16140f':'transparent',cursor:saving?'not-allowed':'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}
          title={saving?'Salvando...':saved?'Salvo!':'Salvar'}>
          {saving
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B99A54" strokeWidth="1.8" style={{animation:'spin 1s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            : saved
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B99A54" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#736d5d" strokeWidth="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          }
        </button>
        <style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>
      </div>
    </div>
  )
}
