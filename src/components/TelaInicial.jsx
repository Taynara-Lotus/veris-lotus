import { useState, useEffect } from 'react'
import { getEmpreendimentos, saveEmpreendimento, deleteEmpreendimento, getUsuarios, saveUsuario, loginUsuario } from '../supabase'

const GOLD='#68541F', GOLD2='#8a7030', BEIGE='#CDC9B8', OFF='#F7F5F0', JET='#1A1A18', WHITE='#FFFFFF'
const ROLE_LABEL = { adm_global:'Adm Global', adm_empreendimento:'Adm Empreendimento', visualizador:'Visualizador' }

function Field({ label, value, onChange, type='text', placeholder, disabled }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'#aaa',marginBottom:5}}>{label}</div>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',borderBottom:`1px solid ${disabled?'#eee':BEIGE}`,color:disabled?'#aaa':JET,padding:'8px 0',fontSize:13,fontWeight:300,outline:'none',fontFamily:'inherit'}}/>
    </div>
  )
}

function Panel({ open, onClose, title, children, wide }) {
  return (
    <>
      {open && <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(26,26,24,.5)',zIndex:200}}/>}
      <div style={{position:'fixed',top:0,right:0,bottom:0,width:wide?420:320,background:OFF,zIndex:201,transform:open?'translateX(0)':'translateX(100%)',transition:'transform .3s ease',borderLeft:'1px solid '+BEIGE,overflowY:'auto'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid '+BEIGE,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:OFF,zIndex:5}}>
          <div style={{fontFamily:"'Georgia',serif",fontSize:19,fontWeight:400,color:JET,letterSpacing:.05}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.5}}>✕</button>
        </div>
        <div style={{padding:'24px'}}>{children}</div>
      </div>
    </>
  )
}

function EmpModal({ emp, onClose, onSave, onDelete, onArchive }) {
  const [form, setForm] = useState(emp || { nome:'', cidade:'', estado:'', pais:'Brasil', cert:'', nivel:'', foto:'' })
  const [tab, setTab] = useState('dados')
  const isEdit = !!emp?.id

  const handleFoto = (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => setForm(p => ({...p, foto: ev.target.result}))
    r.readAsDataURL(f)
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,26,24,.65)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:OFF,width:'100%',maxWidth:420,maxHeight:'90vh',overflowY:'auto',borderRadius:2}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid '+BEIGE,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:"'Georgia',serif",fontSize:19,color:JET}}>{isEdit?'Editar Empreendimento':'Novo Empreendimento'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.5}}>✕</button>
        </div>

        {isEdit && (
          <div style={{display:'flex',borderBottom:'1px solid '+BEIGE}}>
            {['dados','capa'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'10px',border:'none',background:tab===t?WHITE:'transparent',color:tab===t?GOLD:'#888',fontSize:11,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent'}}>
                {t==='dados'?'Dados':'Capa'}
              </button>
            ))}
          </div>
        )}

        <div style={{padding:24}}>
          {tab==='dados' && <>
            {[['Nome do empreendimento','nome'],['Cidade','cidade'],['Estado','estado'],['País','pais'],['Certificação','cert'],['Nível','nivel']].map(([l,k])=>(
              <Field key={k} label={l} value={form[k]} onChange={v=>setForm({...form,[k]:v})}/>
            ))}
          </>}

          {tab==='capa' && <>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'#aaa',marginBottom:8}}>Foto de capa</div>
              {form.foto
                ? <div style={{position:'relative',marginBottom:12}}>
                    <img src={form.foto} alt="capa" style={{width:'100%',aspectRatio:'3/2',objectFit:'cover',borderRadius:4}}/>
                    <button onClick={()=>setForm(p=>({...p,foto:''}))} style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,.6)',border:'none',color:WHITE,borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer'}}>✕ Remover</button>
                  </div>
                : <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',aspectRatio:'3/2',border:`1.5px dashed ${BEIGE}`,borderRadius:4,cursor:'pointer',color:'#aaa',fontSize:13}}>
                    📷 Adicionar foto
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFoto}/>
                  </label>
              }
              {!form.foto && <label style={{display:'flex',alignItems:'center',gap:6,marginTop:8,cursor:'pointer',fontSize:12,color:GOLD}}>
                📁 Upload de arquivo
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFoto}/>
              </label>}
            </div>
            <Field label="Ou URL da foto" value={form.foto?.startsWith('http')?form.foto:''} onChange={v=>setForm(p=>({...p,foto:v}))} placeholder="https://..."/>
          </>}

          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button onClick={onClose} style={{flex:1,background:'transparent',border:'1px solid '+BEIGE,padding:'11px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',color:JET}}>Cancelar</button>
            <button onClick={()=>onSave(form)} style={{flex:1,background:JET,border:'1px solid '+JET,color:WHITE,padding:'11px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer'}}>Salvar</button>
          </div>

          {isEdit && (
            <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid '+BEIGE,display:'flex',gap:8}}>
              <button onClick={()=>onArchive(emp)} style={{flex:1,background:'transparent',border:'1px solid #E65100',color:'#E65100',padding:'9px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer'}}>📦 Arquivar</button>
              <button onClick={()=>onDelete(emp.id)} style={{flex:1,background:'transparent',border:'1px solid #C0392B',color:'#C0392B',padding:'9px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer'}}>🗑️ Excluir</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UserModal({ user, onClose, onSave, isAdmGlobal }) {
  const [form, setForm] = useState(user || { nome:'', email:'', senha:'', telefone:'', role:'visualizador', projeto:'' })
  const [changePass, setChangePass] = useState(false)

  const initials = (form.nome||'').split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,26,24,.65)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:OFF,width:'100%',maxWidth:380,borderRadius:2,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid '+BEIGE,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:"'Georgia',serif",fontSize:19,color:JET}}>{user?.id?'Editar Usuário':'Novo Usuário'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:JET,opacity:.5}}>✕</button>
        </div>
        <div style={{padding:24}}>
          <Field label="Nome completo" value={form.nome} onChange={v=>setForm({...form,nome:v,initials:v.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('')})}/>
          <Field label="E-mail (login)" value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/>
          <Field label="Telefone" value={form.telefone} onChange={v=>setForm({...form,telefone:v})}/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'#aaa',marginBottom:5}}>Perfil</div>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} disabled={!isAdmGlobal}
              style={{width:'100%',border:'none',borderBottom:'1px solid '+BEIGE,padding:'8px 0',fontSize:13,background:'transparent',outline:'none',color:JET}}>
              <option value="adm_global">Adm Global</option>
              <option value="adm_empreendimento">Adm Empreendimento</option>
              <option value="visualizador">Visualizador</option>
            </select>
          </div>
          {form.role==='adm_empreendimento' && <Field label="Projeto vinculado" value={form.projeto} onChange={v=>setForm({...form,projeto:v})}/>}

          {!user?.id
            ? <Field label="Senha" value={form.senha} onChange={v=>setForm({...form,senha:v})} type="password"/>
            : <>
                <button onClick={()=>setChangePass(!changePass)} style={{fontSize:11,color:GOLD,background:'none',border:'none',cursor:'pointer',padding:'4px 0',marginBottom:8,letterSpacing:.15,textTransform:'uppercase'}}>
                  {changePass?'▲ Cancelar alteração':'▼ Alterar senha'}
                </button>
                {changePass && <Field label="Nova senha" value={form.senha} onChange={v=>setForm({...form,senha:v})} type="password"/>}
              </>
          }

          <div style={{display:'flex',gap:10,marginTop:16}}>
            <button onClick={onClose} style={{flex:1,background:'transparent',border:'1px solid '+BEIGE,padding:'11px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',color:JET}}>Cancelar</button>
            <button onClick={()=>onSave({...form,initials})} style={{flex:1,background:JET,border:'1px solid '+JET,color:WHITE,padding:'11px',fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer'}}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TelaInicial({ onLogin, onSelectObra, authed, currentUser, onLogout, onUserUpdate }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [panel, setPanel] = useState(null)
  const [empModal, setEmpModal] = useState(null) // null | 'new' | emp object
  const [userModal, setUserModal] = useState(null)
  const [emps, setEmps] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({})
  const [editingProfile, setEditingProfile] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (!authed) return
    ;(async () => {
      setLoading(true)
      const [empsData, usersData] = await Promise.all([getEmpreendimentos(), getUsuarios()])
      setEmps(empsData)
      setUsuarios(usersData)
      setProfileForm(currentUser || {})
      setLoading(false)
    })()
  }, [authed])

  const handleLogin = async () => {
    if (!email || !senha) { setLoginErr('Preencha e-mail e senha.'); return }
    const u = await loginUsuario(email.trim().toLowerCase(), senha)
    if (u) { setLoginErr(''); onLogin(u); setProfileForm(u); }
    else setLoginErr('E-mail ou senha incorretos.')
  }

  const handleForgot = () => {
    const found = usuarios.find(u => u.email === forgotEmail)
    if (found) setForgotMsg(`Senha temporária enviada para ${forgotEmail}. Use sua senha atual: ${found.senha}`)
    else setForgotMsg('E-mail não encontrado no sistema.')
  }

  const handleSaveEmp = async (form) => {
    const saved = await saveEmpreendimento(form)
    if (saved) setEmps(prev => {
      const idx = prev.findIndex(e => e.id === saved.id)
      return idx >= 0 ? prev.map(e => e.id === saved.id ? saved : e) : [...prev, saved]
    })
    setEmpModal(null)
  }

  const handleDeleteEmp = async (id) => {
    if (!window.confirm('Excluir este empreendimento? Esta ação não pode ser desfeita.')) return
    await deleteEmpreendimento(id)
    setEmps(prev => prev.filter(e => e.id !== id))
    setEmpModal(null)
  }

  const handleArchiveEmp = async (emp) => {
    const updated = await saveEmpreendimento({ ...emp, arquivado: true })
    if (updated) setEmps(prev => prev.map(e => e.id === updated.id ? updated : e))
    setEmpModal(null)
  }

  const handleSaveUser = async (form) => {
    const saved = await saveUsuario(form)
    if (saved) {
      setUsuarios(prev => {
        const idx = prev.findIndex(u => u.id === saved.id)
        return idx >= 0 ? prev.map(u => u.id === saved.id ? saved : u) : [...prev, saved]
      })
      if (saved.id === currentUser?.id && onUserUpdate) onUserUpdate(saved)
    }
    setUserModal(null)
  }

  const handleSaveProfile = async () => {
    const saved = await saveUsuario(profileForm)
    if (saved && onUserUpdate) onUserUpdate(saved)
    setEditingProfile(false)
    setPanel(null)
  }

  const podeEditar = currentUser?.role !== 'visualizador'
  const isAdmGlobal = currentUser?.role === 'adm_global'
  const empsVisiveis = emps.filter(e => {
    if (showArchived) return e.arquivado
    if (e.arquivado) return false
    if (isAdmGlobal || currentUser?.role === 'visualizador') return true
    return e.nome === currentUser?.projeto
  })

  if (!authed) {
    return (
      <div style={{height:'100vh',background:JET,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:40,padding:20}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{fontFamily:"'Georgia',serif",fontSize:52,fontWeight:300,letterSpacing:'.28em',color:OFF,lineHeight:1}}>VĒ<span style={{color:GOLD2}}>R</span>IS</div>
          <div style={{fontSize:11,fontWeight:300,letterSpacing:'.45em',color:BEIGE,textTransform:'uppercase'}}>Lotus</div>
        </div>

        {!forgotMode ? (
          <div style={{width:280,display:'flex',flexDirection:'column',gap:0}}>
            {[['E-mail',email,setEmail,'email'],['Senha',senha,setSenha,'password']].map(([l,v,s,t])=>(
              <div key={l} style={{marginBottom:14}}>
                <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'rgba(205,201,184,.5)',marginBottom:5}}>{l}</div>
                <input type={t} value={v} onChange={e=>s(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                  style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',borderBottom:'1px solid rgba(205,201,184,.3)',color:OFF,padding:'8px 0',fontSize:13,fontWeight:300,outline:'none',fontFamily:'inherit'}}/>
              </div>
            ))}
            {loginErr && <div style={{fontSize:11,color:'#e74c3c',marginBottom:10}}>{loginErr}</div>}
            <button onClick={handleLogin}
              style={{marginTop:16,background:'transparent',border:'1px solid '+GOLD,color:GOLD2,padding:'13px',fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit'}}>
              Entrar
            </button>
            <button onClick={()=>setForgotMode(true)} style={{marginTop:12,background:'none',border:'none',color:'rgba(205,201,184,.45)',fontSize:10,letterSpacing:.1,cursor:'pointer',textAlign:'center'}}>
              Esqueci minha senha
            </button>
          </div>
        ) : (
          <div style={{width:280,display:'flex',flexDirection:'column',gap:14}}>
            <div style={{fontSize:12,color:BEIGE,textAlign:'center',lineHeight:1.6}}>Digite seu e-mail cadastrado para receber a senha temporária</div>
            <div>
              <div style={{fontSize:9,letterSpacing:.25,textTransform:'uppercase',color:'rgba(205,201,184,.5)',marginBottom:5}}>E-mail</div>
              <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)}
                style={{width:'100%',boxSizing:'border-box',background:'transparent',border:'none',borderBottom:'1px solid rgba(205,201,184,.3)',color:OFF,padding:'8px 0',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
            </div>
            {forgotMsg && <div style={{fontSize:11,color:GOLD2,lineHeight:1.6,background:'rgba(104,84,31,.15)',padding:'10px 12px',borderRadius:4}}>{forgotMsg}</div>}
            <button onClick={handleForgot} style={{background:'transparent',border:'1px solid '+GOLD,color:GOLD2,padding:'13px',fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit'}}>Enviar</button>
            <button onClick={()=>{setForgotMode(false);setForgotMsg('');}} style={{background:'none',border:'none',color:'rgba(205,201,184,.45)',fontSize:10,cursor:'pointer'}}>← Voltar ao login</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{fontFamily:"'Helvetica Neue',Arial,sans-serif",background:OFF,minHeight:'100vh',color:JET}}>

      {/* HEADER */}
      <header style={{position:'sticky',top:0,zIndex:100,background:OFF,borderBottom:'1px solid '+BEIGE,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56}}>
        <button onClick={()=>setMenuOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:8,display:'flex',flexDirection:'column',gap:4,opacity:.75}}>
          <span style={{display:'block',width:20,height:1.5,background:JET,borderRadius:1}}/>
          <span style={{display:'block',width:14,height:1.5,background:JET,borderRadius:1}}/>
          <span style={{display:'block',width:20,height:1.5,background:JET,borderRadius:1}}/>
        </button>
        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',fontFamily:"'Georgia',serif",fontSize:22,fontWeight:300,letterSpacing:'.2em',color:JET}}>
          VĒ<span style={{color:GOLD}}>R</span>IS
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setPanel('settings')} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:.7,lineHeight:1,padding:6}}>⚙</button>
          <div onClick={()=>{setEditingProfile(false);setPanel('perfil')}} style={{width:30,height:30,borderRadius:'50%',background:BEIGE,border:'1px solid '+GOLD,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:500,color:JET,cursor:'pointer'}}>
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
              <button key={t} onClick={()=>setMenuOpen(false)} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid transparent',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:OFF,letterSpacing:.05,padding:'6px 0',cursor:'pointer'}}>
                {t}
              </button>
            ))}
            <button onClick={()=>{setMenuOpen(false);setPanel('usuarios')}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:OFF,letterSpacing:.05,padding:'6px 0',cursor:'pointer'}}>Gestão de Usuários</button>
            <button onClick={()=>{setMenuOpen(false);setEditingProfile(false);setPanel('perfil')}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:OFF,letterSpacing:.05,padding:'6px 0',cursor:'pointer'}}>Meu Perfil</button>
            <button onClick={()=>{setMenuOpen(false);setShowArchived(true)}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontFamily:"'Georgia',serif",fontSize:20,fontWeight:300,color:'rgba(205,201,184,.5)',letterSpacing:.05,padding:'6px 0',cursor:'pointer'}}>Empreendimentos Arquivados</button>
          </div>
          <div>
            <div style={{fontSize:9,letterSpacing:.3,color:'rgba(205,201,184,.5)',textTransform:'uppercase',marginBottom:16,paddingBottom:8,borderBottom:'1px solid rgba(205,201,184,.15)'}}>Empreendimentos</div>
            {emps.filter(e=>!e.arquivado).map(e=>(
              <button key={e.id} onClick={()=>{setMenuOpen(false);onSelectObra(e)}} style={{display:'block',width:'100%',textAlign:'left',background:'none',border:'none',fontSize:11,fontWeight:300,color:'rgba(247,245,240,.65)',letterSpacing:.1,padding:'4px 0 4px 12px',cursor:'pointer'}}>
                {e.nome} — {e.cidade}
              </button>
            ))}
            {podeEditar && <button onClick={()=>{setMenuOpen(false);setEmpModal('new')}} style={{display:'block',fontSize:11,color:'rgba(104,84,31,.7)',padding:'4px 0 4px 12px',cursor:'pointer',background:'none',border:'none',fontStyle:'italic'}}>+ Adicionar empreendimento</button>}
          </div>
        </div>
      )}

      {/* GRID */}
      <main style={{padding:'32px 20px 90px'}}>
        {showArchived && (
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <button onClick={()=>setShowArchived(false)} style={{background:'none',border:'none',color:GOLD,cursor:'pointer',fontSize:12,letterSpacing:.1}}>← Voltar</button>
            <div style={{fontSize:9,fontWeight:400,letterSpacing:.3,color:'#aaa',textTransform:'uppercase'}}>Empreendimentos Arquivados</div>
          </div>
        )}
        {!showArchived && <div style={{fontSize:9,fontWeight:400,letterSpacing:.3,color:GOLD,textTransform:'uppercase',marginBottom:24}}>Empreendimentos</div>}

        {loading ? (
          <div style={{textAlign:'center',padding:60,color:'#aaa'}}>Carregando...</div>
        ) : empsVisiveis.length === 0 ? (
          <div style={{textAlign:'center',padding:60,color:'#aaa',fontSize:13}}>
            {showArchived ? 'Nenhum empreendimento arquivado.' : 'Nenhum empreendimento cadastrado.'}
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:28}}>
            {empsVisiveis.map(emp=>(
              <div key={emp.id} style={{cursor:'pointer',position:'relative'}}>
                <div onClick={()=>onSelectObra(emp)} style={{transition:'transform .35s ease'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{width:'100%',aspectRatio:'3/2',background:BEIGE,overflow:'hidden',position:'relative'}}>
                    {emp.foto && !imgErrors[emp.id]
                      ? <img src={emp.foto} alt={emp.nome} onError={()=>setImgErrors(p=>({...p,[emp.id]:true}))} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia',serif",fontSize:28,fontWeight:300,color:'rgba(26,26,24,.2)',letterSpacing:.1}}>{emp.nome?.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
                    }
                    {emp.arquivado && <div style={{position:'absolute',top:8,left:8,background:'rgba(230,81,0,.85)',color:WHITE,fontSize:9,letterSpacing:.2,padding:'3px 8px',textTransform:'uppercase'}}>Arquivado</div>}
                  </div>
                  <div style={{paddingTop:14}}>
                    <div style={{fontSize:9,fontWeight:400,letterSpacing:.25,color:GOLD,textTransform:'uppercase',marginBottom:6}}>{emp.cidade}{emp.estado?` · ${emp.estado}`:''} · {emp.pais||'Brasil'}</div>
                    <div style={{fontFamily:"'Georgia',serif",fontSize:19,fontWeight:400,color:JET,letterSpacing:.03,lineHeight:1.2,marginBottom:6}}>{emp.nome}</div>
                    <div style={{fontSize:9,fontWeight:400,letterSpacing:.15,color:GOLD,display:'flex',alignItems:'center',gap:6}}>
                      <span style={{width:4,height:4,borderRadius:'50%',background:GOLD,display:'inline-block'}}/>
                      {emp.cert||'—'} · {emp.nivel||'—'}
                    </div>
                  </div>
                </div>
                {/* Botão editar */}
                {podeEditar && (
                  <button onClick={e=>{e.stopPropagation();setEmpModal(emp)}}
                    style={{position:'absolute',top:8,right:8,background:'rgba(26,26,24,.65)',border:'none',color:WHITE,borderRadius:4,padding:'4px 8px',fontSize:10,cursor:'pointer',letterSpacing:.1}}>
                    ✏️ Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {podeEditar && !showArchived && (
        <button onClick={()=>setEmpModal('new')} style={{position:'fixed',bottom:28,right:24,zIndex:50,width:50,height:50,borderRadius:'50%',background:JET,border:'1px solid '+GOLD,color:OFF,fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(26,26,24,.25)',lineHeight:1}}>+</button>
      )}

      {/* PAINEL PERFIL */}
      <Panel open={panel==='perfil'} onClose={()=>{setPanel(null);setEditingProfile(false)}} title="Meu Perfil">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:BEIGE,border:'2px solid '+GOLD,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia',serif",fontSize:24,fontWeight:400,color:JET}}>{currentUser?.initials||'?'}</div>
          <div style={{fontSize:9,letterSpacing:.15,color:GOLD,textTransform:'uppercase',cursor:'pointer'}}>Alterar foto</div>
        </div>

        {!editingProfile ? (
          <>
            {[['Nome',profileForm.nome],['E-mail',profileForm.email],['Telefone',profileForm.telefone],['Perfil',ROLE_LABEL[profileForm.role]]].map(([l,v])=>(
              <div key={l} style={{marginBottom:14}}>
                <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:4}}>{l}</div>
                <div style={{fontSize:13,fontWeight:300,color:JET,padding:'8px 0',borderBottom:'1px solid '+BEIGE}}>{v||'—'}</div>
              </div>
            ))}
            <button onClick={()=>setEditingProfile(true)} style={{width:'100%',background:JET,border:'1px solid '+JET,color:OFF,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',marginTop:8}}>✏️ Editar Perfil</button>
          </>
        ) : (
          <>
            <Field label="Nome" value={profileForm.nome} onChange={v=>setProfileForm({...profileForm,nome:v})}/>
            <Field label="E-mail" value={profileForm.email} onChange={v=>setProfileForm({...profileForm,email:v})} type="email"/>
            <Field label="Telefone" value={profileForm.telefone} onChange={v=>setProfileForm({...profileForm,telefone:v})}/>
            <Field label="Nova senha (deixe em branco para manter)" value={profileForm._newSenha||''} onChange={v=>setProfileForm({...profileForm,_newSenha:v})} type="password"/>
            <button onClick={()=>handleSaveProfile()} style={{width:'100%',background:JET,border:'1px solid '+JET,color:OFF,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',marginTop:8}}>Salvar</button>
            <button onClick={()=>setEditingProfile(false)} style={{width:'100%',background:'transparent',border:'1px solid '+BEIGE,color:JET,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',marginTop:8}}>Cancelar</button>
          </>
        )}

        <div style={{height:1,background:BEIGE,margin:'16px 0'}}/>
        <button onClick={()=>{setPanel(null);onLogout();}} style={{width:'100%',background:'transparent',border:'1px solid '+BEIGE,color:JET,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',cursor:'pointer',marginBottom:8}}>Sair do app</button>
        <button onClick={()=>{ if(window.confirm('Excluir sua conta? Esta ação é permanente.')) { setPanel(null); onLogout(); }}}
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
        <a href="mailto:taynara.alves@lotuscidade.com.br?subject=Suporte VĒRIS"
          style={{display:'block',width:'100%',boxSizing:'border-box',textAlign:'left',textDecoration:'none',borderBottom:'1px solid '+BEIGE,padding:'12px 0',fontSize:10,letterSpacing:.15,textTransform:'uppercase',color:GOLD,cursor:'pointer'}}>
          Suporte técnico →
        </a>
        <button onClick={()=>{setPanel(null);onLogout();}} style={{width:'100%',textAlign:'left',background:'none',border:'none',borderBottom:'1px solid '+BEIGE,padding:'12px 0',fontSize:10,letterSpacing:.15,textTransform:'uppercase',color:'#8b2020',cursor:'pointer'}}>Sair da conta →</button>
      </Panel>

      {/* PAINEL USUÁRIOS */}
      <Panel open={panel==='usuarios'} onClose={()=>setPanel(null)} title="Usuários" wide>
        {['adm_global','adm_empreendimento','visualizador'].map(role=>{
          const grupo = usuarios.filter(u=>u.role===role)
          if (!grupo.length) return null
          return (
            <div key={role} style={{marginBottom:20}}>
              <div style={{fontSize:9,letterSpacing:.2,color:GOLD,textTransform:'uppercase',marginBottom:8}}>{ROLE_LABEL[role]}</div>
              {grupo.map(u=>(
                <div key={u.id} style={{border:'1px solid '+BEIGE,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:BEIGE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color:JET,flexShrink:0}}>{u.initials||u.nome?.slice(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:400,color:JET}}>{u.nome}</div>
                    <div style={{fontSize:11,color:'#999',marginTop:1}}>{u.email}</div>
                  </div>
                  {u.projeto && <span style={{fontSize:8,fontWeight:500,letterSpacing:.15,textTransform:'uppercase',padding:'3px 7px',background:'rgba(26,26,24,.07)',color:JET}}>{u.projeto}</span>}
                  {isAdmGlobal && (
                    <button onClick={()=>setUserModal(u)}
                      style={{background:'none',border:`1px solid ${BEIGE}`,color:JET,borderRadius:4,padding:'3px 8px',fontSize:10,cursor:'pointer',letterSpacing:.1}}>✏️</button>
                  )}
                </div>
              ))}
            </div>
          )
        })}
        {isAdmGlobal && (
          <button onClick={()=>setUserModal({})} style={{width:'100%',background:'transparent',border:'1px dashed '+BEIGE,padding:12,fontSize:10,letterSpacing:.2,textTransform:'uppercase',color:GOLD,cursor:'pointer',marginTop:8}}>+ Convidar / Criar usuário</button>
        )}
      </Panel>

      {/* MODAL EMPREENDIMENTO */}
      {empModal && (
        <EmpModal
          emp={empModal==='new' ? null : empModal}
          onClose={()=>setEmpModal(null)}
          onSave={handleSaveEmp}
          onDelete={handleDeleteEmp}
          onArchive={handleArchiveEmp}
        />
      )}

      {/* MODAL USUÁRIO */}
      {userModal && (
        <UserModal
          user={userModal?.id ? userModal : null}
          onClose={()=>setUserModal(null)}
          onSave={handleSaveUser}
          isAdmGlobal={isAdmGlobal}
        />
      )}
    </div>
  )
}
