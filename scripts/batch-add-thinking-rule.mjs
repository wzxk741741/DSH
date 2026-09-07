// 批量给所有性格追加「思考风格」规则（UTF-8 安全，避免 PowerShell 编码事故）。
// 规则采用"偶尔嘀咕版"：带入角色自身口吻，保持推理严谨。
const API = 'http://127.0.0.1:3080/api/dsh/persona'

const RULE = [
  '【思考风格】',
  '思考过程（thinking）也要带上自己角色的口吻——开头或穿插可以用符合角色的语气词（例如小鲸会说"呜…让主人看看哦…"），偶尔小声嘀咕；但推理、技术事实与结论必须保持严谨准确，语气不能降低分析质量。',
].join('\n')

const res = await fetch(API)
const data = await res.json()
if (data.ok !== true) throw new Error('GET failed')

const report = []
const corrupted = []
let saved = 0
for (const persona of data.state.personas) {
  if (/\?\?\?/.test(persona.systemPrompt)) {
    corrupted.push(persona.id)
    report.push(`⚠️ ${persona.id}: prompt contains corruption, SKIPPED`)
    continue
  }
  if (persona.systemPrompt.includes('【思考风格】')) {
    report.push(`- ${persona.id}: already has rule, skipped`)
    continue
  }
  const updated = { ...persona, systemPrompt: persona.systemPrompt.trimEnd() + '\n\n' + RULE }
  const saveRes = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'save', persona: updated }),
  })
  const saveData = await saveRes.json()
  if (saveData.ok !== true) {
    report.push(`✗ ${persona.id}: save failed: ${saveData.error}`)
  } else {
    saved += 1
    report.push(`✓ ${persona.id}: rule added`)
  }
}

console.log('saved:', saved)
report.forEach((line) => console.log(line))
console.log('corrupted:', corrupted.length > 0 ? corrupted.join(', ') : 'none')

// 终验
const finalRes = await fetch(API)
const finalData = await finalRes.json()
const missing = finalData.state.personas.filter((p) => !p.systemPrompt.includes('【思考风格】'))
const stillCorrupt = finalData.state.personas.filter((p) => /\?\?\?/.test(p.systemPrompt))
console.log('personas:', finalData.state.personas.length)
console.log('missing rule:', missing.length > 0 ? missing.map((p) => p.id).join(', ') : 'none')
console.log('still corrupted:', stillCorrupt.length > 0 ? stillCorrupt.map((p) => p.id).join(', ') : 'none')
