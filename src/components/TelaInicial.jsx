import { useState } from 'react'

const GOLD='#68541F', GOLD2='#8a7030', BEIGE='#CDC9B8', OFF='#F7F5F0', JET='#1A1A18', WHITE='#FFFFFF'

// ── Usuários demo ─────────────────────────────────────────────────
const USUARIOS = [
  { id:1, email:'admin@lotus.com',   senha:'lotus123', nome:'Taynara Araujo', tel:'+55 11 98765-4321', role:'adm_global',        initials:'TA' },
  { id:2, email:'marcos@lotus.com',  senha:'lotus123', nome:'Marcos Silva',   tel:'+55 11 91234-5678', role:'adm_empreendimento', initials:'MS', projeto:'Caraíva Bay' },
  { id:3, email:'lais@lotus.com',    senha:'lotus123', nome:'Laís Pereira',   tel:'+55 11 99876-5432', role:'adm_empreendimento', initials:'LP', projeto:'Trancoso Heights' },
  { id:4, email:'rafael@lotus.com',  senha:'lotus123', nome:'Rafael Oliveira',tel:'+55 11 93456-7890', role:'visualizador',       initials:'RO' },
]

const ROLE_LABEL = { adm_global:'Adm Global', adm_empreendimento:'Adm Empreendimento', visualizador:'Visualizador' }
const ROLE_COLOR = { adm_global:GOLD, adm_empreendimento:'#555', visualizador:'#999' }

// ── Empreendimentos demo ──────────────────────────────────────────
const EMPREENDIMENTOS_DEMO = [
  { id:1, nome:'Caraíva Bay',       cidade:'Bahia',       pais:'Brasil', cert:'AQUA Gold',        nivel:'Nível 3', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { id:2, nome:'Trancoso Heights',  cidade:'Bahia',       pais:'Brasil', cert:'LEED Platinum',    nivel:'Nível 5', img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
  { id:3, nome:'Alto Pantanal',     cidade:'Mato Grosso', pais:'Brasil', cert:'EDGE Advanced',    nivel:'Nível 4', img:'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=600&q=80' },
  { id:4, nome:'Chapada Veris',     cidade:'Goiás',       pais:'Brasil', cert:'BREEAM Excellent',  nivel:'Nível 4', img:'https://images.unsplash.com/photo-1482192505345-5852b7a23338?w=600&q=80' },
]

function Field({ label, value, onChange, type='text', placeholder }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'rgba(205,201,184,.5)',marginBottom:5}}>{label}</div>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',borderBottom:'1px solid rgba(205,201,184,.3)',color:OFF,padding:'8px 0',fontSize:13,fontWeight:300,letterSpacing:.05,outline:'none',fontFamily:'inherit',transition:'border-color .2s'}}
        onFocus={e=>e.target.style.borderBottomColor=GOLD2}
        onBlur={e=>e.target.style.borderBottomColor='rgba(205,201,184,.3)'}
      />
    </div>
  )
}

// ── Painel deslizante ─────────────────────────────────────────────
function Panel({ open, onClose, title, children }) {
  return (
    <>
      {open && <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(26,26,24,.5)',zIndex:200}}/>}
      <div style={{position:'fixed',top:0,right:0,bottom:0,width:320,background:OFF,zIndex:201,transform:open?'translateX(0)':'translateX(100%)',transition:'transform .3s ease',borderLeft:'1px solid '+BEIGE,overflowY:'auto'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid '+BEIGE,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:"'Georgia',serif",fontSize:19,fontWeight:400,color:JET,letterSpacing:.05}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.5}}>✕</button>
        </div>
        <div style={{padding:'24px'}}>{children}</div>
      </div>
    </>
  )
}

// ── Modal de adicionar empreendimento ─────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ nome:'', cidade:'', pais:'Brasil', cert:'', nivel:'' })
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,26,24,.65)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:OFF,width:'100%',maxWidth:380,padding:32}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"'Georgia',serif",fontSize:21,color:JET,marginBottom:24,letterSpacing:.03}}>Novo Empreendimento</div>
        {[['Nome','nome'],['Cidade','cidade'],['País','pais'],['Certificação','cert'],['Nível','nivel']].map(([l,k])=>(
          <div key={k} style={{marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'#aaa',marginBottom:4}}>{l}</div>
            <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
              style={{width:'100%',boxSizing:'border-box',border:'none',borderBottom:'1px solid '+BEIGE,padding:'8px 0',fontSize:13,background:'transparent',outline:'none'}}/>
          </div>
        ))}
        <div style={{display:'flex',gap:10,marginTop:24}}>
          <button onClick={onClose} style={{flex:1,background:'transparent',border:'1px solid '+BEIGE,padding:'11px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer'}}>Cancelar</button>
          <button onClick={()=>{ onAdd({...form, id:Date.now(), img:''}); onClose(); }}
            style={{flex:1,background:JET,border:'1px solid '+JET,color:WHITE,padding:'11px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer'}}>Adicionar</button>
        </div>
      </div>
    </div>
  )
}

export default function TelaInicial({ onLogin, onSelectObra, authed, currentUser, onLogout }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [panel, setPanel] = useState(null) // 'perfil' | 'settings' | 'usuarios'
  const [addOpen, setAddOpen] = useState(false)
  const [emps, setEmps] = useState(EMPREENDIMENTOS_DEMO)
  const [usuarios, setUsuarios] = useState(USUARIOS)
  const [profileForm, setProfileForm] = useState(currentUser || {})
  const [imgErrors, setImgErrors] = useState({})

  const handleLogin = () => {
    const u = USUARIOS.find(x => x.email === email && x.senha === senha)
    if (u) { setLoginErr(''); onLogin(u); setProfileForm(u); }
    else setLoginErr('E-mail ou senha incorretos.')
  }

  // Filtra empreendimentos por permissão
  const empsVisiveis = authed
    ? (currentUser?.role === 'adm_global' || currentUser?.role === 'visualizador'
        ? emps
        : emps.filter(e => e.nome === currentUser?.projeto))
    : []

  const podeEditar = currentUser?.role !== 'visualizador'

  if (!authed) {
    // ── Tela de Login ────────────────────────────────────────────
    return (
      <div style={{height:'100vh',background:JET,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:40}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{fontFamily:"'Georgia',serif",fontSize:52,fontWeight:300,letterSpacing:'.28em',color:OFF,lineHeight:1}}>
            VĒ<span style={{color:GOLD2}}>R</span>IS
          </div>
          <div style={{fontSize:11,fontWeight:300,letterSpacing:'.45em',color:BEIGE,textTransform:'uppercase'}}>Lotus</div>
        </div>
        <div style={{width:280,display:'flex',flexDirection:'column',gap:0}}>
          <Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seu@email.com"/>
          <Field label="Senha" value={senha} onChange={setSenha} type="password" placeholder="••••••••"/>
          {loginErr && <div style={{fontSize:11,color:'#e74c3c',marginBottom:10}}>{loginErr}</div>}
          <button onClick={handleLogin}
            onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            style={{marginTop:16,background:'transparent',border:'1px solid '+GOLD,color:GOLD2,padding:'13px',fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',cursor:'pointer',transition:'all .3s',fontFamily:'inherit'}}
            onMouseEnter={e=>{e.target.style.background=GOLD;e.target.style.color=OFF}}
            onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color=GOLD2}}>
            Entrar
          </button>
        </div>
        <div style={{fontSize:9,color:'rgba(205,201,184,.35)',letterSpacing:.08}}>admin@lotus.com · lotus123</div>
      </div>
    )
  }

  // ── Grid de empreendimentos ──────────────────────────────────
  return (
    <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",background:OFF,minHeight:'100vh',color:JET}}>

      {/* HEADER */}
      <header style={{position:'sticky',top:0,zIndex:100,background:OFF,borderBottom:'1px solid '+BEIGE,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56}}>
        {/* Hambúrguer */}
        <button onClick={()=>setMenuOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:8,display:'flex',flexDirection:'column',gap:4,opacity:.75}} aria-label="Menu">
          <span style={{display:'block',width:20,height:1.5,background:JET,borderRadius:1}}/>
          <span style={{display:'block',width:14,height:1.5,background:JET,borderRadius:1}}/>
          <span style={{display:'block',width:20,height:1.5,background:JET,borderRadius:1}}/>
        </button>

        {/* Logo centralizada */}
        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',fontFamily:"'Georgia',serif",fontSize:22,fontWeight:300,letterSpacing:'.2em',color:JET}}>
          VĒ<span style={{color:GOLD}}>R</span>IS
        </div>

        {/* Direita */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setPanel('settings')} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:.7,lineHeight:1,padding:6}}>⚙</button>
          <div onClick={()=>setPanel('perfil')} style={{width:30,height:30,borderRadius:'50%',background:BEIGE,border:'1px solid '+GOLD,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:500,color:JET,cursor:'pointer',letterSpacing:.05}}>
            {currentUser?.initials||'?'}
          </div>
        </div>
      </header>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(26,26,24,.72)',backdropFilter:'blur(2px)',zIndex:150,display:'flex',flexDirection:'column',padding:'72px 40px 40px',gap:40}}>
          <button onClick={()=>setMenuOpen(false)} style={{position:'absolute',top:16,right:24,background:'none',border:'none',color:BEIGE,fontSize:22,cursor:'pointer',opacity:.7}}>✕</button>
          <div>
            <div style={{fontSize:9,letterSpacing:.3,color:'rgba(205,201,184,.5)',textTransform:'uppercase',marginBottom:16,paddingBottom:8,borderBottom:'1px solid rgba(205,201,184,.15)'}}>Menu Principal</div>
            {['Início','Relatórios','Documentos'].map(t=>(
              <button key={t} onClick={()=>setMenuOpen(false)} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid transparent',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:OFF,letterSpacing:.05,padding:'6px 0',cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>e.target.style.paddingLeft='8px'}
                onMouseLeave={e=>e.target.style.paddingLeft='0'}>{t}</button>
            ))}
            <button onClick={()=>{setMenuOpen(false);setPanel('usuarios')}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid transparent',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:OFF,letterSpacing:.05,padding:'6px 0',cursor:'pointer',transition:'all .2s'}}>Gestão de Usuários</button>
            <button onClick={()=>{setMenuOpen(false);setPanel('perfil')}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid transparent',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:OFF,letterSpacing:.05,padding:'6px 0',cursor:'pointer',transition:'all .2s'}}>Meu Perfil</button>
          </div>
          <div>
            <div style={{fontSize:9,letterSpacing:.3,color:'rgba(205,201,184,.5)',textTransform:'uppercase',marginBottom:16,paddingBottom:8,borderBottom:'1px solid rgba(205,201,184,.15)'}}>Empreendimentos</div>
            {empsVisiveis.map(e=>(
              <button key={e.id} onClick={()=>{setMenuOpen(false);onSelectObra(e)}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontSize:11,fontWeight:300,color:'rgba(247,245,240,.65)',letterSpacing:.1,padding:'4px 0 4px 12px',cursor:'pointer',transition:'color .2s'}}
                onMouseEnter={ev=>ev.target.style.color=OFF}
                onMouseLeave={ev=>ev.target.style.color='rgba(247,245,240,.65)'}>{e.nome} — {e.cidade}</button>
            ))}
            {podeEditar && (
              <button onClick={()=>{setMenuOpen(false);setAddOpen(true)}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontSize:11,fontWeight:300,color:'rgba(104,84,31,.7)',letterSpacing:.1,padding:'4px 0 4px 12px',cursor:'pointer',fontStyle:'italic'}}>+ Adicionar empreendimento</button>
            )}
          </div>
        </div>
      )}

      {/* GRID */}
      <main style={{padding:'32px 20px 90px'}}>
        <div style={{fontSize:9,fontWeight:400,letterSpacing:.3,color:GOLD,textTransform:'uppercase',marginBottom:24}}>Empreendimentos</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:28}}>
          {empsVisiveis.map(emp=>(
            <div key={emp.id} onClick={()=>onSelectObra(emp)} style={{cursor:'pointer',transition:'transform .35s ease'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              <div style={{width:'100%',aspectRatio:'3/2',background:BEIGE,overflow:'hidden',position:'relative'}}>
                {emp.img && !imgErrors[emp.id]
                  ? <img src={emp.img} alt={emp.nome} onError={()=>setImgErrors(p=>({...p,[emp.id]:true}))}
                      style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia',serif",fontSize:28,fontWeight:300,color:'rgba(26,26,24,.2)',letterSpacing:.1}}>{emp.nome.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                }
              </div>
              <div style={{paddingTop:14}}>
                <div style={{fontSize:9,fontWeight:400,letterSpacing:.25,color:GOLD,textTransform:'uppercase',marginBottom:6}}>{emp.cidade} · {emp.pais}</div>
                <div style={{fontFamily:"'Georgia',serif",fontSize:19,fontWeight:400,color:JET,letterSpacing:.03,lineHeight:1.2,marginBottom:6}}>{emp.nome}</div>
                <div style={{fontSize:9,fontWeight:400,letterSpacing:.15,color:GOLD,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:4,height:4,borderRadius:'50%',background:GOLD,display:'inline-block'}}/>
                  {emp.cert} · {emp.nivel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* BOTÃO + */}
      {podeEditar && (
        <button onClick={()=>setAddOpen(true)} style={{position:'fixed',bottom:28,right:24,zIndex:50,width:50,height:50,borderRadius:'50%',background:JET,border:'1px solid '+GOLD,color:OFF,fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(26,26,24,.25)',transition:'all .25s',lineHeight:1}}
          onMouseEnter={e=>e.target.style.background=GOLD}
          onMouseLeave={e=>e.target.style.background=JET}>+</button>
      )}

      {/* PAINEL PERFIL */}
      <Panel open={panel==='perfil'} onClose={()=>setPanel(null)} title="Meu Perfil">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:BEIGE,border:'2px solid '+GOLD,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia',serif",fontSize:24,fontWeight:400,color:JET,cursor:'pointer'}}>{currentUser?.initials||'?'}</div>
          <div style={{fontSize:9,letterSpacing:.15,color:GOLD,textTransform:'uppercase',cursor:'pointer'}}>Alterar foto</div>
        </div>
        {[['Nome','nome'],['Telefone','tel']].map(([l,k])=>(
          <div key={k} style={{marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:4}}>{l}</div>
            <input value={profileForm[k]||''} onChange={e=>setProfileForm({...profileForm,[k]:e.target.value})}
              style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',borderBottom:'1px solid '+BEIGE,padding:'8px 0',fontSize:13,fontWeight:300,outline:'none'}}/>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:4}}>Perfil</div>
          <div style={{fontSize:13,fontWeight:300,color:JET,padding:'8px 0',borderBottom:'1px solid '+BEIGE}}>{ROLE_LABEL[currentUser?.role]}</div>
        </div>
        <button style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid '+BEIGE,padding:'12px 0',fontSize:10,letterSpacing:.15,textTransform:'uppercase',color:GOLD,cursor:'pointer'}} onClick={()=>alert('E-mail de redefinição enviado.')}>Redefinir senha →</button>
        <button onClick={()=>{setProfileForm(profileForm);setPanel(null);}} style={{width:'100%',background:JET,border:'1px solid '+JET,color:OFF,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',marginTop:16,transition:'all .2s'}}
          onMouseEnter={e=>e.target.style.background=GOLD}
          onMouseLeave={e=>e.target.style.background=JET}>Salvar</button>
        <div style={{height:1,background:BEIGE,margin:'16px 0'}}/>
        <button onClick={()=>{setPanel(null);onLogout();}} style={{width:'100%',background:'transparent',border:'1px solid '+BEIGE,color:JET,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',marginBottom:8}}>Sair do app</button>
        <button onClick={()=>{ if(window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é permanente.')) { setPanel(null); onLogout(); } }}
          style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid '+BEIGE,padding:'12px 0',fontSize:10,letterSpacing:.15,textTransform:'uppercase',color:'#8b2020',cursor:'pointer'}}>Excluir conta →</button>
      </Panel>

      {/* PAINEL CONFIGURAÇÕES */}
      <Panel open={panel==='settings'} onClose={()=>setPanel(null)} title="Configurações">
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:4}}>Plataforma</div>
          <div style={{fontSize:13,fontWeight:300,color:JET,padding:'8px 0',borderBottom:'1px solid '+BEIGE}}>VĒRIS by Lotus</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:4}}>Versão</div>
          <div style={{fontSize:13,fontWeight:300,color:JET,padding:'8px 0',borderBottom:'1px solid '+BEIGE}}>2.0.0</div>
        </div>
        <button style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid '+BEIGE,padding:'12px 0',fontSize:10,letterSpacing:.15,textTransform:'uppercase',color:GOLD,cursor:'pointer'}}>Suporte técnico →</button>
        <button onClick={()=>{setPanel(null);onLogout();}} style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid '+BEIGE,padding:'12px 0',fontSize:10,letterSpacing:.15,textTransform:'uppercase',color:'#8b2020',cursor:'pointer'}}>Sair da conta →</button>
      </Panel>

      {/* PAINEL USUÁRIOS */}
      <Panel open={panel==='usuarios'} onClose={()=>setPanel(null)} title="Usuários">
        {['adm_global','adm_empreendimento','visualizador'].map(role=>{
          const grupo = usuarios.filter(u=>u.role===role)
          if (!grupo.length) return null
          return (
            <div key={role} style={{marginBottom:20}}>
              <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:8}}>{ROLE_LABEL[role]}</div>
              {grupo.map(u=>(
                <div key={u.id} style={{border:'1px solid '+BEIGE,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:BEIGE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color:JET,flexShrink:0}}>{u.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:400,color:JET}}>{u.nome}</div>
                    <div style={{fontSize:11,color:'#999',marginTop:1}}>{u.email}</div>
                  </div>
                  {u.projeto && <span style={{fontSize:8,fontWeight:500,letterSpacing:.15,textTransform:'uppercase',padding:'3px 7px',background:'rgba(26,26,24,.07)',color:JET}}>{u.projeto}</span>}
                </div>
              ))}
            </div>
          )
        })}
        <button onClick={()=>alert('Convite enviado!')} style={{width:'100%',background:'transparent',border:'1px dashed '+BEIGE,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',color:GOLD,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>+ Convidar usuário</button>
      </Panel>

      {/* MODAL NOVO EMPREENDIMENTO */}
      {addOpen && (
        <AddModal
          onClose={()=>setAddOpen(false)}
          onAdd={emp=>setEmps(prev=>[...prev, emp])}
        />
      )}
    </div>
  )
}
