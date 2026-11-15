export function Gauge({ label, used, limit, unit, icon, margin, prefix = '' }) {
  const percentage = Math.min(100, Math.round(used / limit * 100))
  const over = margin < 0
  const near = !over && percentage >= 85
  return <div className="gauge"><div className="gauge-head"><span className="gauge-label"><i>{icon}</i>{label}</span><span className={`gauge-state ${over ? 'bad' : near ? 'warn' : ''}`}>{over ? 'OVER LIMIT' : near ? 'NEAR LIMIT' : 'ON TRACK'}</span></div><div className="gauge-values"><b>{prefix}{used}<small> {unit}</small></b><span>OF {prefix}{limit}{unit}</span></div><div className="gauge-track"><i className={over ? 'bad' : near ? 'warn' : ''} style={{ width: `${percentage}%` }}/></div><div className="gauge-foot"><span>{over ? `Exceeds by ${prefix}${Math.abs(margin)} ${unit}` : `${prefix}${margin} ${unit} remaining`}</span><span>{percentage}%</span></div></div>
}

export default function Resource({ label, used, limit, unit, icon, margin, prefix = '' }) {
  const percentage = Math.min(100, Math.round(used / limit * 100))
  const over = margin < 0
  const near = !over && percentage >= 85
  return <div className="resource"><div className="resource-top"><div className="resource-name"><span>{icon}</span>{label}</div><span className={`resource-state ${over ? 'bad' : near ? 'warn' : ''}`}>{over ? 'OVER LIMIT' : near ? 'NEAR LIMIT' : 'ON TRACK'}</span></div><div className="resource-numbers"><strong>{prefix}{used}<small> {unit}</small></strong><span>OF {prefix}{limit}{unit}</span></div><div className="meter"><i className={over ? 'bad' : near ? 'warn' : ''} style={{ width: `${percentage}%` }}/></div><div className="resource-bottom"><span>{over ? `Exceeds by ${prefix}${Math.abs(margin)} ${unit}` : `${prefix}${margin} ${unit} remaining`}</span><span>{percentage}%</span></div></div>
}
