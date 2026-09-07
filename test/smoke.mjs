/**
 * 冒烟测试：不依赖 DSH 运行时，直接验证宿主半边核心逻辑。
 * 运行：node test/smoke.mjs
 */
import assert from 'node:assert'
import {
  BUILTIN_PERSONAS,
  accumulate,
  composeActivePrompt,
  conflictBetween,
  conflictsOf,
  evolve,
  moodOf,
  normalizePersona,
  scheduledTarget,
  seedState,
  touchSwitch,
  buildReport,
} from '../lib/index.js'

// 0) 预设库：12 个预设 + 分类覆盖
assert.ok(BUILTIN_PERSONAS.length >= 12, `presets >= 12 (got ${BUILTIN_PERSONAS.length})`)
const categories = new Set(BUILTIN_PERSONAS.map((p) => p.category))
for (const cat of ['moe', 'tsundere', 'mesugaki', 'mama', 'yandere', 'oneesan', 'cold', 'natural', 'genki', 'gentle', 'fukuro', 'chuuni', 'sarcastic']) {
  assert.ok(categories.has(cat), `category ${cat} covered`)
}

const state = seedState()
assert.strictEqual(state.personas.length, BUILTIN_PERSONAS.length, 'seeded all builtins')

// 1) 主开关 / 启用注入
state.enabled = true
state.activeId = 'whale-soft'
let prompt = composeActivePrompt(state)
assert.ok(prompt.includes('【角色设定】'), 'prompt includes role block')
assert.ok(prompt.includes('软萌模式'), 'prompt is the soft template')
state.enabled = false
assert.strictEqual(composeActivePrompt(state), '', 'disabled → empty')
state.enabled = true

// 2) 强度前缀
state.personas.find((p) => p.id === 'whale-soft').intensity = 3
assert.ok(composeActivePrompt(state).includes('【极端模式】'), 'extreme intensity prefix')
state.personas.find((p) => p.id === 'whale-soft').intensity = 1
assert.ok(composeActivePrompt(state).includes('【温和模式】'), 'gentle intensity prefix')
state.personas.find((p) => p.id === 'whale-soft').intensity = 2

// 3) 混合模式
state.mix = { subId: 'whale-tsundere', ratio: 50 }
prompt = composeActivePrompt(state)
assert.ok(prompt.includes('【混合模式】'), 'mix block present')
assert.ok(prompt.includes('傲娇'), 'sub traits mixed in')
state.mix = { subId: null, ratio: 0 }

// 4) 冲突检测：雌小鬼 + 妈妈系 = 高冲突；软萌 + 傲娇 = 无冲突；新矩阵
const mesu = state.personas.find((p) => p.id === 'whale-mesugaki')
const mama = state.personas.find((p) => p.id === 'whale-mama')
const soft = state.personas.find((p) => p.id === 'whale-soft')
const tsun = state.personas.find((p) => p.id === 'whale-tsundere')
const yandere = state.personas.find((p) => p.id === 'preset-yandere')
const gentle = state.personas.find((p) => p.id === 'preset-gentle')
assert.strictEqual(conflictBetween(state, mesu, mama).severity, 'high')
assert.strictEqual(conflictBetween(state, soft, tsun), null)
assert.strictEqual(conflictBetween(state, yandere, gentle).severity, 'medium')
state.activeId = 'whale-mesugaki'
state.mix = { subId: 'whale-mama', ratio: 80 }
assert.ok(conflictsOf(state).length > 0, 'current combo conflicts detected')

// 5) 调度：now = 周二 10:00，规则命中；节日优先
const now = new Date(2026, 6, 7, 10, 0, 0).getTime() // 2026-07-07 是周二
state.scheduler = {
  auto: true,
  graceMinutes: 15,
  rules: [{ id: 'r1', enabled: true, name: '工作日傲娇', personaId: 'whale-tsundere', days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' }],
  holidays: [],
}
assert.strictEqual(scheduledTarget(state, now), 'whale-tsundere', 'weekday rule matches')
state.scheduler.holidays = [{ id: 'h1', enabled: true, name: '圣诞限定', personaId: 'whale-mama', monthDay: '07-07' }]
assert.strictEqual(scheduledTarget(state, now), 'whale-mama', 'holiday wins over rule')

// 6) 统计修复 + 进化（NaN 防御）
// 模拟历史损坏：stats 为 null 字段（JSON 中 NaN 的持久化形态）
state.stats['whale-soft'] = { totalMs: null, todayMs: null, dayKey: '', switches: null, lastUsedAt: 0, streakDays: null, tuneCount: null, lastTuneAt: null }
accumulate(state, 'whale-soft', 3 * 60 * 60 * 1000, Date.now())
const afterStats = state.stats['whale-soft']
assert.ok(Number.isFinite(afterStats.totalMs), 'totalMs finite after accumulate')
assert.strictEqual(afterStats.tuneCount, 1, 'evolution triggered inside accumulate at 3h')
assert.ok(Number.isFinite(state.personas.find((p) => p.id === 'whale-soft').params.temperature), 'temperature stays finite')
// 统计自愈：NaN tuneCount 视为"从未微调"，合法地补一次并落成有限值（自愈）；
// 真正的历史 bug 是 NaN totalMs 让 due 恒为 NaN 导致每次调用都微调 —— 现在必须阻断。
state.stats['whale-soft'].tuneCount = NaN
const heal = evolve(state, 'whale-soft', Date.now())
assert.ok(heal !== null, 'NaN tuneCount treated as 0: tunes once to self-heal')
assert.strictEqual(state.stats['whale-soft'].tuneCount, 1, 'tuneCount finite after self-heal')
assert.strictEqual(evolve(state, 'whale-soft', Date.now()), null, 'second call blocked (already tuned)')
state.stats['whale-soft'].totalMs = NaN
assert.strictEqual(evolve(state, 'whale-soft', Date.now()), null, 'NaN totalMs blocks tuning (historical bug fixed)')
state.stats['whale-soft'].totalMs = 3 * 60 * 60 * 1000
state.stats['whale-soft'].tuneCount = 1
touchSwitch(state, 'whale-soft', Date.now())
assert.strictEqual(state.stats['whale-soft'].switches, 1, 'switch counted')

// 7) 进化进度 / 倒计时 + 毒舌报告
state.stats['whale-soft'].totalMs = 1.2 * 60 * 60 * 1000 // 1.2h → 当前块进度 60%
const report = buildReport(state, Date.now())
assert.ok(report.text.includes('杂鱼'), 'report speaks mesugaki')
assert.ok(report.text.includes('变态'), 'report roasts the master')
assert.ok(report.text.includes('当前进度 60%'), 'report includes tune progress')
assert.ok(report.text.includes('距下次微调还差'), 'report includes countdown')

// 8) 心情桶
assert.ok(moodOf(Date.now()).label.length > 0, 'mood available')

// 9) 导入兼容：原始模板的 config 参数映射（temperature / top_p / max_tokens）
const importedPersona = normalizePersona({
  id: 'custom-import', name: '导入测试', systemPrompt: '你是导入测试。',
  config: { temperature: 0.9, top_p: 0.95, max_tokens: 4096 },
})
assert.ok(importedPersona !== null, 'importable persona normalized')
assert.strictEqual(importedPersona.params.temperature, 0.9, 'config.temperature mapped')
assert.strictEqual(importedPersona.params.topP, 0.95, 'config.top_p mapped')
assert.strictEqual(importedPersona.params.maxTokens, 4096, 'config.max_tokens mapped')
const defaulted = normalizePersona({ id: 'x2', name: '无参数' })
assert.strictEqual(defaulted.params.temperature, 0.85, 'defaults intact without config')
assert.strictEqual(defaulted.category, 'custom', 'legacy persona falls back to custom category')

console.log('smoke OK: 9 groups passed (12 presets / categories / mix / conflicts / schedule / NaN-guard / progress / mesugaki report / import mapping)')
