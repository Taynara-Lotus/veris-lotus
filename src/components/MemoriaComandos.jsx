import { useState } from 'react'

const GOLD='#68541F', BEIGE='#CDC9B8', JET='#1A1A18', WHITE='#FFFFFF', OFF='#F7F5F0'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('pt-BR')
}

const ACAO_ICON = {
  'Registro criado':'📍','Registro editado':'✏️','Registro excluído':'🗑️',
  'Planta carregada':'🗺️','Pavimento excluído':'🏗️',
  'Dados da obra atualizados':'📋','Nº de série reiniciado':'🔄',
}

function Confirm({msg,onYes,onNo}){
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:WHITE,borderRadius:12,padding:28,maxWidth:340,width:'90%',boxShadow:'0 8px 40px rgba(0,0,0,.4)'}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>⚠️ Confirmar exclusão</div>
        <div style={{fontSize:13,color:'#555',marginBottom:22}}>{msg}</div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onNo} style={{background:'transparent',border:`1.5px solid ${GOLD}`,color:GOLD,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button onClick={onYes} style={{background:'#C0392B',border:'1.5px solid #C0392B',color:WHITE,borderRadius:6,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

export default function MemoriaComandos({ logs, currentUser, onDeleteLogs }) {
  const [selected, setSelected] = useState(new Set())
  const [confirmDel, setConfirmDel] = useState(false)
  const isAdmGlobal = currentUser?.role === 'adm_global'

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    if (selected.size === logs.length) setSelected(new Set())
    else setSelected(new Set(logs.map((_, i) => i)))
  }

  const handleDelete = () => {
    if (onDeleteLogs) onDeleteLogs([...selected])
    setSelected(new Set())
    setConfirmDel(false)
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <h2 style={{color:GOLD,margin:0,fontWeight:300,letterSpacing:1}}>Memória de Comandos</h2>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:12,color:'#aaa'}}>{logs.length} registro(s)</div>
          {isAdmGlobal && logs.length > 0 && (
            <>
              <button onClick={toggleAll}
                style={{background:'transparent',border:`1px solid ${BEIGE}`,color:JET,borderRadius:6,padding:'6px 12px',fontSize:11,cursor:'pointer',letterSpacing:.2}}>
                {selected.size===logs.length?'Desmarcar tudo':'Selecionar tudo'}
              </button>
              {selected.size > 0 && (
                <button onClick={()=>setConfirmDel(true)}
                  style={{background:'#C0392B',border:'none',color:WHITE,borderRadius:6,padding:'6px 14px',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                  🗑️ Excluir ({selected.size})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!isAdmGlobal && (
        <div style={{marginBottom:16,padding:'10px 14px',background:OFF,border:`1px solid ${BEIGE}`,borderRadius:4,fontSize:11,color:'#aaa'}}>
          🔒 Somente perfil <b>Adm Global</b> pode excluir registros do log.
        </div>
      )}

      {logs.length === 0 ? (
        <div style={{textAlign:'center',padding:60,color:'#bbb',fontSize:13}}>Nenhuma movimentação registrada ainda.</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {logs.map((log, i) => (
            <div key={i} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:`1px solid ${BEIGE}`,alignItems:'flex-start',background:selected.has(i)?'#FFF8F0':'transparent',transition:'background .15s'}}>
              {/* Checkbox — só ADM Global vê */}
              {isAdmGlobal && (
                <input type="checkbox" checked={selected.has(i)} onChange={()=>toggleSelect(i)}
                  style={{marginTop:8,flexShrink:0,width:15,height:15,cursor:'pointer',accentColor:GOLD}}/>
              )}
              {/* Ícone */}
              <div style={{width:32,height:32,borderRadius:'50%',background:OFF,border:`1px solid ${BEIGE}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                {ACAO_ICON[log.acao] || '📌'}
              </div>
              {/* Conteúdo */}
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:600,color:JET}}>{log.acao}</span>
                  <span style={{fontSize:10,background:OFF,border:`1px solid ${BEIGE}`,color:'#888',padding:'2px 8px',borderRadius:10,letterSpacing:.2}}>
                    👤 {log.usuario || 'Sistema'}
                  </span>
                </div>
                {log.detalhe && <div style={{fontSize:12,color:'#888',marginBottom:2}}>{log.detalhe}</div>}
                <div style={{fontSize:10,color:'#bbb',letterSpacing:.2}}>{fmt(log.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:24,padding:'12px 16px',background:OFF,border:`1px solid ${BEIGE}`,borderRadius:4,fontSize:11,color:'#aaa',display:'flex',alignItems:'center',gap:8}}>
        🔒 Este log registra automaticamente todas as movimentações. {isAdmGlobal?'Apenas Adm Global pode excluir entradas.':'Visualização somente leitura.'}
      </div>

      {confirmDel && (
        <Confirm
          msg={`Deseja excluir ${selected.size} entrada(s) do log? Esta ação não pode ser desfeita.`}
          onYes={handleDelete}
          onNo={()=>setConfirmDel(false)}
        />
      )}
    </div>
  )
}
