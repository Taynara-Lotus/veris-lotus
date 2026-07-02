const GOLD='#68541F', BEIGE='#CDC9B8', JET='#1A1A18', WHITE='#FFFFFF', OFF='#F7F5F0'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('pt-BR')
}

const ACAO_ICON = {
  'Registro criado': '📍',
  'Registro editado': '✏️',
  'Registro excluído': '🗑️',
  'Planta carregada': '🗺️',
  'Pavimento excluído': '🏗️',
  'Dados da obra atualizados': '📋',
  'Nº de série reiniciado': '🔄',
}

export default function MemoriaComandos({ logs }) {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h2 style={{color:GOLD,margin:0,fontWeight:300,letterSpacing:1}}>Memória de Comandos</h2>
        <div style={{fontSize:12,color:'#aaa'}}>{logs.length} registro(s) · somente leitura</div>
      </div>

      {logs.length === 0 ? (
        <div style={{textAlign:'center',padding:60,color:'#bbb',fontSize:13}}>Nenhuma movimentação registrada ainda.</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {logs.map((log, i) => (
            <div key={i} style={{display:'flex',gap:16,padding:'14px 0',borderBottom:`1px solid ${BEIGE}`,alignItems:'flex-start'}}>
              {/* Linha do tempo */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0,width:40}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:OFF,border:`1px solid ${BEIGE}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>
                  {ACAO_ICON[log.acao] || '📌'}
                </div>
                {i < logs.length - 1 && <div style={{width:1,height:'100%',minHeight:20,background:BEIGE}}/>}
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
        🔒 Este log é somente leitura e registra automaticamente todas as movimentações do empreendimento.
      </div>
    </div>
  )
}
