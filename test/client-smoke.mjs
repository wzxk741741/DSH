/**
 * 客户端冒烟测试：用最小化的浏览器环境（伪 DOM/window/fetch/react）真实执行
 * lib/client.js 的 loader 工厂，验证：
 *   1. window.__ModuleLoader__.load 被正确调用（id 与 package.json 一致）；
 *   2. 工厂执行无异常，导出 name/inject/apply；
 *   3. apply(ctx) 完成 slots 注册（settings.section + sidebar.footer.action），
 *      且不再注册 conversation.input.dock、不再挂键盘监听；
 *   4. 侧栏状态条目（BadgeChip）渲染 + 点击弹出快捷浮层（含进化倒计时），
 *      浮层外点击关闭；POST 切换流程走通并弹出过渡提示；
 *   5. 卸载清理（effect cleanup）移除 DOM 与监听。
 * 运行：node test/client-smoke.mjs
 */
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

/* ---------------- 伪浏览器环境 ---------------- */

function makeElement(tag) {
  const el = {
    tagName: String(tag || 'div').toUpperCase(),
    children: [],
    style: {},
    dataset: {},
    attributes: {},
    listeners: {},
    textContent: '',
    className: '',
    type: '',
    value: '',
    parentNode: null,
    appendChild(child) { child.parentNode = this; this.children.push(child); return child },
    removeChild(child) { child.parentNode = null; this.children = this.children.filter((c) => c !== child); return child },
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn) },
    removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] || []).filter((f) => f !== fn) },
    setAttribute(k, v) { this.attributes[k] = String(v) },
    getAttribute(k) { return this.attributes[k] },
    getBoundingClientRect() { return { left: 10, top: 500, right: 110, bottom: 520, width: 100, height: 20 } },
    contains(node) { return this === node || this.children.some((child) => child.contains(node)) },
    click() { for (const fn of this.listeners.click || []) fn({ currentTarget: this, preventDefault() {} }) },
    set innerHTML(v) { this._innerHTML = v; this.children = [] },
    get innerHTML() {
      if (this.children.length > 0) return this.children.map((child) => child.innerHTML ?? child.textContent ?? '').join('')
      if (this._innerHTML !== undefined) return this._innerHTML
      return this.textContent
    },
  }
  return el
}

const body = makeElement('body')
const head = makeElement('head')
const docListeners = {}
const documentMock = {
  body,
  head,
  createElement: (tag) => makeElement(tag),
  querySelector: () => null,
  addEventListener(type, fn) { (docListeners[type] ||= []).push(fn) },
  removeEventListener(type, fn) { docListeners[type] = (docListeners[type] || []).filter((f) => f !== fn) },
}

const winListeners = {}
const windowMock = {
  listeners: winListeners,
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener(type, fn) { (winListeners[type] ||= []).push(fn) },
  removeEventListener(type, fn) { winListeners[type] = (winListeners[type] || []).filter((f) => f !== fn) },
  confirm: () => true,
  setTimeout: () => 0,
  clearTimeout: () => {},
  __ModuleLoader__: { load: (spec) => { windowMock.capturedLoad = spec } },
}

globalThis.window = windowMock
globalThis.document = documentMock
globalThis.setInterval = () => 1
globalThis.clearInterval = () => {}
const fetchCalls = []
const cannedState = {
  ok: true,
  enabled: true,
  activeId: 'whale-soft',
  active: { id: 'whale-soft', name: '软萌小鲸', icon: '🐋', category: 'moe', greeting: '💖 小鲸已经准备好啦！', farewell: '💤' },
  mix: { subId: null, ratio: 0, subName: null, subIcon: null },
  allowConflicts: false,
  personas: [
    { id: 'whale-soft', name: '软萌小鲸', icon: '🐋', category: 'moe', tags: ['软萌'], sampleLines: ['呜…主人…'], params: { temperature: 0.85, topP: 0.9, maxTokens: 2048 }, intensity: 2, conflictsWith: [], builtin: true, greeting: '💖', farewell: '💤', systemPrompt: 'x', keywords: [], coreTraits: [], styleRules: [] },
    { id: 'whale-tsundere', name: '傲娇小鲸', icon: '😤', category: 'tsundere', tags: [], sampleLines: [], params: { temperature: 0.8, topP: 0.85, maxTokens: 2048 }, intensity: 2, conflictsWith: [], builtin: true, greeting: '哼', farewell: '切', systemPrompt: 'x', keywords: [], coreTraits: [], styleRules: [] },
  ],
  conflicts: [],
  mood: { emoji: '📚', label: '上午专注' },
  quickSlots: ['whale-soft', 'whale-tsundere'],
  activity: {
    'whale-soft': { todayText: '12 分钟', totalText: '1 小时', share: 60, todayMs: 720000, totalMs: 3600000, switches: 3, streakDays: 2, affinity: 70, tuneCount: 0, tuneProgressPct: 50, tuneRemainingText: '1 小时', tuneRemainingMs: 3600000, lastUsedAt: Date.now() },
  },
  scheduler: { auto: false, graceMinutes: 15, rules: [], holidays: [] },
  nextAuto: null,
  notices: [],
  intensityNames: { 1: '温和', 2: '标准', 3: '极端' },
  categoryNames: { moe: '萌系', tsundere: '傲娇系', custom: '自定义' },
  builtinCatalog: [{ id: 'whale-soft', name: '软萌小鲸', icon: '🐋', category: 'moe' }],
  deletedBuiltins: [],
}
globalThis.fetch = (url, options = {}) => {
  fetchCalls.push({ url, options })
  if (options.method === 'POST') {
    const payload = JSON.parse(options.body || '{}')
    if (payload.action === 'switch') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ ok: true, state: cannedState, target: { name: '软萌小鲸', icon: '🐋' }, greeting: '💖 小鲸已经准备好啦！' }),
      })
    }
    return Promise.resolve({ ok: true, json: async () => ({ ok: true, state: cannedState }) })
  }
  return Promise.resolve({ ok: true, json: async () => ({ ok: true, state: cannedState }) })
}

/* ---------------- 加载并执行工厂 ---------------- */

const require = createRequire(import.meta.url)
const file = require.resolve('../lib/client.js')
const code = readFileSync(file, 'utf8')
// 回归防线：带 hooks 的组件绝不能当普通函数调用（会把其 hooks 并入父组件的
// hook 序列，导致 "Rendered fewer hooks than expected" 整树卸载 —— 编辑按钮
// 点开没反应的根因）。必须经由 h(Component, props) 挂载。
const HOOK_COMPONENTS = ['BadgeChip', 'EditorCard', 'MixControls', 'CurrentPanel', 'PersonasPanel', 'StatsPanel', 'SchedulerPanel', 'ImportExportPanel', 'PersonaManager']
for (const name of HOOK_COMPONENTS) {
  const pattern = new RegExp(`${name}\\(\\{`)
  assert.ok(!pattern.test(code), `${name} must be mounted via h(), not called as a function (hooks boundary)`)
}
// eslint-disable-next-line no-new-func
new Function(code)()

assert.ok(windowMock.capturedLoad, 'loader handoff captured')
assert.strictEqual(windowMock.capturedLoad.id, '@dsh-external/dsh-whale-persona', 'plugin id matches')

const reactMock = {
  createElement: (tag, props, ...children) => ({ tag, props, children }),
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
  useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
  useRef: (initial) => ({ current: initial }),
}

const plugin = windowMock.capturedLoad.factory((name) => {
  assert.strictEqual(name, 'react', 'client only requires react')
  return reactMock
})

assert.strictEqual(plugin.name, 'ui-whale-persona')
assert.deepStrictEqual(plugin.inject, ['slots'])
assert.strictEqual(typeof plugin.apply, 'function')

/* ---------------- 执行 apply ---------------- */

const cleanups = []
const registrations = []
const injected = []
const ctx = {
  effect(cb, label) {
    const cleanup = cb()
    cleanups.push({ label, cleanup })
    return () => {}
  },
  slots: {
    inject(name, registerFn) {
      injected.push(name)
      return registerFn()
    },
    register(options, component) {
      registrations.push({ options, component })
      return () => {}
    },
  },
}

plugin.apply(ctx)

assert.deepStrictEqual(injected, ['sidebar.footer.action', 'settings.section'], 'footer chip + settings registered, no dock')
assert.ok(!injected.includes('conversation.input.dock'), 'input dock removed as requested')
assert.strictEqual(winListeners.keydown, undefined, 'keyboard shortcuts removed as requested')
const footerReg = registrations.find((r) => r.options.id === 'whale-persona')
const sectionReg = registrations.find((r) => r.options.id === 'dsh-persona')
assert.ok(footerReg, 'sidebar footer entry registered')
assert.strictEqual(footerReg.options.order, 5)
assert.ok(sectionReg, 'settings section registered')
assert.strictEqual(sectionReg.options.order, 110)
assert.strictEqual(typeof footerReg.component, 'function')

// 轮询已启动并完成首次 GET
await new Promise((resolve) => setTimeout(resolve, 10))
assert.ok(fetchCalls.some((c) => c.options.method === undefined), 'polling GET fired')
assert.ok(head.children.some((el) => el.dataset.plugin === '@dsh-external/dsh-whale-persona'), 'style tag injected')

/* ---------------- 侧栏状态条目渲染 + 浮层 ---------------- */

const Chip = footerReg.component
const chipVnode = Chip({})
assert.strictEqual(chipVnode.tag, 'button', 'footer chip renders a button')
assert.ok(String(chipVnode.children).includes('软萌小鲸'), 'chip shows active persona name')

// 点击 chip → 浮层出现（含进化倒计时）
const anchor = makeElement('button')
anchor.getBoundingClientRect = () => ({ left: 10, top: 500, right: 110, bottom: 520, width: 100, height: 20 })
chipVnode.props.onClick({ currentTarget: anchor })
const pop = body.children.find((el) => el.attributes['data-whale-popover'] !== undefined)
assert.ok(pop, 'popover opened')
assert.ok(String(pop.innerHTML).includes('进化倒计时'), 'popover shows tune countdown')
assert.ok(String(pop.innerHTML).includes('当前进度 50%'), 'popover shows progress pct')

// 浮层内点「傲娇小鲸」快捷按钮 → POST switch → toast
const quickBtn = [...pop.children].flatMap((child) => child.children || []).find((el) => el.textContent.includes('傲娇小鲸'))
assert.ok(quickBtn, 'quick switch button exists in popover')
quickBtn.click()
await new Promise((resolve) => setTimeout(resolve, 10))
assert.ok(fetchCalls.some((c) => c.options.method === 'POST' && JSON.parse(c.options.body).action === 'switch' && JSON.parse(c.options.body).id === 'whale-tsundere'), 'quick switch posted')
assert.ok(body.children.some((el) => el.attributes['data-whale-toast'] !== undefined), 'transition toast appeared')

// 浮层外点击 → 关闭
assert.strictEqual(body.children.includes(pop), true)
docListeners.pointerdown[0]({ target: makeElement('div') })
assert.strictEqual(body.children.includes(pop), false, 'popover closed on outside click')

/* ---------------- 卸载清理 ---------------- */

const bodyCountBefore = body.children.length
cleanups.forEach(({ cleanup }) => { if (typeof cleanup === 'function') cleanup() })
assert.strictEqual(docListeners.pointerdown.length, 0, 'document listener removed on cleanup')
assert.ok(body.children.length < bodyCountBefore, 'toast removed on cleanup')

console.log('client smoke OK: loader handoff / factory / apply / footer chip / popover + countdown / quick switch / cleanup all passed (dock & hotkeys removed)')
