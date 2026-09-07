/**
 * @dsh-external/dsh-whale-persona — client half (hand-authored loader bundle).
 *
 * 与宿主半边 lib/index.js 配对；通过 window.__ModuleLoader__.load 注册为
 * 浏览器端 cordis 插件。仅依赖模块表里的 'react'（构建管线约定同官方
 * tsdown.client.ts：externals 走模块表，CSS 手动注入并按 id 标记便于卸载）。
 *
 * 提供：
 *  - 侧栏底部「性格状态」条目（图标+名称+心情，点击展开快捷浮层），
 *    不再使用悬浮角标（会挡住设置按钮），也不会与右下角鲸鱼挂件冲突
 *  - 设置 → 性格管理 完整面板（12 个分类预设库/预览/增删改/混合/
 *    统计报告（含进化进度百分比与倒计时）/定时/导入导出/冲突）
 *  - 切换过渡提示条（含性格问候语）
 *
 * 注意：v0.2 起按用户要求移除了聊天输入区快捷条与 Ctrl/Alt+数字快捷键。
 */
window.__ModuleLoader__.load({
  id: '@dsh-external/dsh-whale-persona',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    /* ---------------------------------------------------------------- */
    /* 样式（data-plugin 标记，卸载时由 loader 清除）                    */
    /* ---------------------------------------------------------------- */

    var PLUGIN_ID = '@dsh-external/dsh-whale-persona'
    var CSS = [
      '.wp-root{box-sizing:border-box;font-family:var(--dsw-font-family,inherit);color:var(--dsw-alias-label-primary,#222)}',
      '.wp-root *{box-sizing:border-box}',
      '.wp-root small{display:block;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;line-height:18px}',
      '.wp-card{background:var(--dsw-specific-tip,var(--dsw-alias-bg-base,#fff));border:1px solid var(--dsw-alias-border-l1,#e5e5e5);border-radius:12px;padding:14px;margin-bottom:12px}',
      '.wp-card h3{margin:0 0 8px;font-size:14px;font-weight:600}',
      '.wp-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}',
      '.wp-row label{font-size:13px;color:var(--dsw-alias-label-secondary,#555)}',
      '.wp-btn{font:inherit;font-size:13px;cursor:pointer;border:1px solid var(--dsw-alias-border-l1,#ccc);background:var(--dsw-alias-interactive-bg-hover,transparent);color:var(--dsw-alias-label-primary,#222);border-radius:8px;padding:5px 10px}',
      '.wp-btn:hover{filter:brightness(1.05)}',
      '.wp-btn:disabled{opacity:.5;cursor:default}',
      '.wp-btn-primary{background:var(--dsw-alias-state-business-primary,#2563eb);border-color:transparent;color:#fff}',
      '.wp-btn-danger{color:var(--dsw-alias-state-danger-primary,#dc2626)}',
      '.wp-chip{display:inline-block;font-size:11px;line-height:18px;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1,#ddd);margin:2px 4px 2px 0;color:var(--dsw-alias-label-secondary,#555)}',
      '.wp-chip-cat{background:var(--dsw-alias-state-business-primary,#2563eb);border-color:transparent;color:#fff}',
      '.wp-input,.wp-select,.wp-textarea{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary,#222);background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#ccc);border-radius:8px;padding:5px 8px;min-width:0}',
      '.wp-textarea{width:100%;resize:vertical}',
      '.wp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}',
      '.wp-tile{border:1px solid var(--dsw-alias-border-l1,#e5e5e5);border-radius:12px;padding:12px;background:var(--dsw-alias-bg-base,#fff)}',
      '.wp-tile-active{outline:2px solid var(--dsw-alias-state-business-primary,#2563eb);outline-offset:-2px}',
      '.wp-bubble{background:var(--dsw-alias-bg-base,#f7f7f7);border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:6px 10px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#444);margin-bottom:6px}',
      '.wp-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}',
      '.wp-tab{font:inherit;font-size:13px;border:1px solid var(--dsw-alias-border-l1,#ccc);background:transparent;color:var(--dsw-alias-label-secondary,#555);border-radius:999px;padding:4px 12px;cursor:pointer}',
      '.wp-tab-on{background:var(--dsw-alias-state-business-primary,#2563eb);border-color:transparent;color:#fff}',
      '.wp-warn{border:1px solid var(--dsw-alias-state-warning-primary,#f59e0b);background:var(--dsw-alias-state-warning-bg,rgba(245,158,11,.12));border-radius:10px;padding:8px 10px;font-size:12px;color:var(--dsw-alias-label-primary,#222);margin-bottom:8px}',
      '.wp-ok{border:1px solid var(--dsw-alias-state-success-primary,#16a34a);background:var(--dsw-alias-state-success-bg,rgba(22,163,74,.12));border-radius:10px;padding:8px 10px;font-size:12px;color:var(--dsw-alias-label-primary,#222);margin-bottom:8px}',
      '.wp-bar{height:6px;border-radius:3px;background:var(--dsw-alias-border-l1,#e5e5e5);overflow:hidden}',
      '.wp-bar-fill{height:100%;background:var(--dsw-alias-state-business-primary,#2563eb)}',
      '.wp-range{width:100%}',
      '.wp-days{display:flex;gap:4px;flex-wrap:wrap}',
      '.wp-days button{font:inherit;font-size:12px;border:1px solid var(--dsw-alias-border-l1,#ccc);background:transparent;border-radius:6px;padding:2px 7px;cursor:pointer;color:var(--dsw-alias-label-secondary,#555)}',
      '.wp-days button.wp-day-on{background:var(--dsw-alias-state-business-primary,#2563eb);color:#fff;border-color:transparent}',
      '.wp-footer-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;font:inherit;font-size:12px;line-height:18px;border:1px solid var(--dsw-alias-border-l1,#ccc);background:transparent;color:var(--dsw-alias-label-primary,#222);border-radius:8px;padding:3px 8px;cursor:pointer;white-space:nowrap;overflow:hidden}',
      '.wp-footer-chip:hover{background:var(--dsw-alias-interactive-bg-hover,transparent)}',
      '.wp-footer-chip-off{opacity:.55}',
      '.wp-pop{position:fixed;z-index:940;width:300px;max-width:calc(100vw - 24px);background:var(--dsw-specific-tip,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:12px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.16);color:var(--dsw-alias-label-primary,#222)}',
      '.wp-pop h4{margin:0 0 8px;font-size:13px}',
      '.wp-toast{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:940;background:var(--dsw-specific-tip,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:12px;padding:10px 16px;font-size:13px;line-height:20px;box-shadow:0 8px 24px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary,#222);max-width:min(480px,calc(100vw - 32px));transition:opacity .35s ease;pointer-events:none}',
      '.wp-toast-em{display:block;color:var(--dsw-alias-label-secondary,#555);margin-top:2px}',
      '.wp-mini{font-size:11px;color:var(--dsw-alias-label-tertiary,#888)}',
    ].join('\n')

    ;(function injectStyles() {
      var tagId = PLUGIN_ID + '/client'
      if (document.querySelector('style[data-plugin-css="' + tagId + '"]') !== null) return
      var tag = document.createElement('style')
      tag.dataset.plugin = PLUGIN_ID
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    })()

    /* ---------------------------------------------------------------- */
    /* 共享 store + API                                                  */
    /* ---------------------------------------------------------------- */

    var API = '/api/dsh/persona'
    var snapshot = null
    var listeners = []
    var store = {
      subscribe: function (fn) {
        listeners.push(fn)
        return function () {
          listeners = listeners.filter(function (item) { return item !== fn })
        }
      },
      getSnapshot: function () { return snapshot },
      set: function (next) {
        snapshot = next
        listeners.slice().forEach(function (fn) { try { fn() } catch (e) { /* noop */ } })
      },
    }

    function parseResponse(r) {
      return r.json().then(function (data) {
        if (!r.ok || data.ok !== true) throw new Error((data && data.error) || 'HTTP ' + r.status)
        return data
      })
    }

    function apiGet() {
      return fetch(API, { credentials: 'same-origin' }).then(parseResponse)
    }

    function apiPost(payload) {
      return fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(parseResponse)
    }

    var pollTimer = null
    var heartbeatTimer = null
    var polling = false

    function refresh() {
      return apiGet().then(function (data) {
        store.set(data.state)
      }).catch(function () { /* 宿主未就绪时静默 */ })
    }

    function startPolling() {
      if (polling) return
      polling = true
      refresh()
      pollTimer = setInterval(refresh, 4000)
      heartbeatTimer = setInterval(function () {
        apiPost({ action: 'heartbeat', seconds: 60 }).then(function (data) {
          store.set(data.state)
        }).catch(function () { /* noop */ })
      }, 60000)
    }

    function stopPolling() {
      polling = false
      if (pollTimer !== null) { clearInterval(pollTimer); pollTimer = null }
      if (heartbeatTimer !== null) { clearInterval(heartbeatTimer); heartbeatTimer = null }
    }

    /* ---------------------------------------------------------------- */
    /* 过渡提示条                                                        */
    /* ---------------------------------------------------------------- */

    var toastStack = []
    function showToast(main, sub, ms) {
      var node = document.createElement('div')
      node.className = 'wp-toast'
      node.setAttribute('data-whale-toast', '')
      var line = document.createElement('div')
      line.textContent = main
      node.appendChild(line)
      if (sub) {
        var em = document.createElement('div')
        em.className = 'wp-toast-em'
        em.textContent = sub
        node.appendChild(em)
      }
      document.body.appendChild(node)
      toastStack.push(node)
      node.style.bottom = (64 + (toastStack.length - 1) * 52) + 'px'
      setTimeout(function () {
        node.style.opacity = '0'
        setTimeout(function () {
          if (node.parentNode !== null) node.parentNode.removeChild(node)
          toastStack = toastStack.filter(function (item) { return item !== node })
          toastStack.forEach(function (item, index) {
            item.style.bottom = (64 + index * 52) + 'px'
          })
        }, 400)
      }, typeof ms === 'number' ? ms : 3200)
    }

    /* ---------------------------------------------------------------- */
    /* 动作封装                                                          */
    /* ---------------------------------------------------------------- */

    function switchTo(id) {
      return apiPost({ action: 'switch', id: id }).then(function (data) {
        store.set(data.state)
        if (data.target) {
          showToast('已切换到「' + data.target.name + '」' + (data.target.icon || '') + ' ✨', data.greeting || '')
        } else {
          showToast('性格已停用 💤', '系统提示词中不再注入性格')
        }
      }).catch(function (err) {
        showToast('切换失败', err.message)
      })
    }

    function setEnabledFlag(on) {
      return apiPost({ action: 'setEnabled', enabled: on }).then(function (data) {
        store.set(data.state)
        showToast(on ? '性格系统已开启 💡' : '性格系统已关闭 🌙', on ? '已注入当前性格到系统提示词' : '已从系统提示词移除性格文本')
      }).catch(function (err) { showToast('操作失败', err.message) })
    }

    function setMix(subId, ratio) {
      return apiPost({ action: 'setMix', subId: subId, ratio: ratio }).then(function (data) {
        store.set(data.state)
        if (subId && ratio > 0) {
          var sub = (data.state.personas || []).find(function (p) { return p.id === subId })
          showToast('混合模式 ' + ratio + '% 🧪', sub ? '主性格 + 「' + sub.name + '」' : '')
        } else {
          showToast('混合模式已关闭 ↩️')
        }
      }).catch(function (err) { showToast('混合失败', err.message) })
    }

    /* ---------------------------------------------------------------- */
    /* 快捷浮层（挂在侧栏底部状态条目上，不再悬浮遮挡界面）              */
    /* ---------------------------------------------------------------- */

    var popover = { el: null, anchor: null, open: false }

    function closePopover() {
      if (popover.el !== null && popover.el.parentNode !== null) popover.el.parentNode.removeChild(popover.el)
      popover.el = null
      popover.anchor = null
      popover.open = false
    }

    function renderPopoverInto(anchorEl) {
      var snap = snapshot
      if (snap === null) return
      if (popover.el === null) {
        popover.el = document.createElement('div')
        popover.el.className = 'wp-pop'
        popover.el.setAttribute('data-whale-popover', '')
        document.body.appendChild(popover.el)
      }
      popover.el.innerHTML = ''
      var h4 = document.createElement('h4')
      h4.textContent = snap.active ? (snap.active.icon || '') + ' ' + snap.active.name : '性格状态'
      popover.el.appendChild(h4)
      var moodRow = document.createElement('div')
      moodRow.className = 'wp-row'
      var moodText = document.createElement('span')
      moodText.className = 'wp-mini'
      moodText.textContent = snap.mood ? '心情：' + snap.mood.emoji + ' ' + snap.mood.label : ''
      moodRow.appendChild(moodText)
      popover.el.appendChild(moodRow)
      // 主开关
      var toggleRow = document.createElement('div')
      toggleRow.className = 'wp-row'
      var toggleLabel = document.createElement('label')
      toggleLabel.textContent = '性格系统：' + (snap.enabled ? '开' : '关')
      toggleRow.appendChild(toggleLabel)
      var toggleBtn = document.createElement('button')
      toggleBtn.type = 'button'
      toggleBtn.className = 'wp-btn' + (snap.enabled ? ' wp-btn-danger' : ' wp-btn-primary')
      toggleBtn.textContent = snap.enabled ? '关闭' : '开启'
      toggleBtn.addEventListener('click', function () { setEnabledFlag(!snap.enabled) })
      toggleRow.appendChild(toggleBtn)
      popover.el.appendChild(toggleRow)
      // 快捷切换（前四个性格）
      var quick = document.createElement('div')
      quick.className = 'wp-row'
      ;(snap.quickSlots || []).slice(0, 4).forEach(function (id) {
        var persona = (snap.personas || []).find(function (p) { return p.id === id })
        if (!persona) return
        var btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'wp-btn' + (snap.activeId === id ? ' wp-btn-primary' : '')
        btn.textContent = persona.icon + ' ' + persona.name
        btn.addEventListener('click', function () { switchTo(id) })
        quick.appendChild(btn)
      })
      popover.el.appendChild(quick)
      // 混合
      var mixRow = document.createElement('div')
      mixRow.className = 'wp-row'
      var mixSelect = document.createElement('select')
      mixSelect.className = 'wp-select'
      var noneOption = document.createElement('option')
      noneOption.value = ''
      noneOption.textContent = '无子性格'
      mixSelect.appendChild(noneOption)
      ;(snap.personas || []).forEach(function (p) {
        if (snap.activeId === p.id) return
        var option = document.createElement('option')
        option.value = p.id
        option.textContent = p.icon + ' ' + p.name
        if (snap.mix.subId === p.id) option.selected = true
        mixSelect.appendChild(option)
      })
      mixRow.appendChild(mixSelect)
      var mixRange = document.createElement('input')
      mixRange.type = 'range'
      mixRange.className = 'wp-range'
      mixRange.min = '0'
      mixRange.max = '100'
      mixRange.step = '5'
      mixRange.value = String(snap.mix.ratio || 0)
      mixRow.appendChild(mixRange)
      var mixApply = document.createElement('button')
      mixApply.type = 'button'
      mixApply.className = 'wp-btn wp-btn-primary'
      mixApply.textContent = '应用混合'
      mixApply.addEventListener('click', function () {
        var subId = mixSelect.value === '' ? null : mixSelect.value
        setMix(subId, Number(mixRange.value))
      })
      mixRow.appendChild(mixApply)
      popover.el.appendChild(mixRow)
      // 进化倒计时
      if (snap.active && snap.activity && snap.activity[snap.active.id]) {
        var row = snap.activity[snap.active.id]
        var tuneRow = document.createElement('div')
        tuneRow.className = 'wp-row'
        var tuneText = document.createElement('span')
        tuneText.className = 'wp-mini'
        tuneText.textContent = '进化倒计时：当前进度 ' + row.tuneProgressPct + '% · 距下次自动微调还差 ' + row.tuneRemainingText
        tuneRow.appendChild(tuneText)
        popover.el.appendChild(tuneRow)
        var barWrap = document.createElement('div')
        barWrap.className = 'wp-bar'
        var fill = document.createElement('div')
        fill.className = 'wp-bar-fill'
        fill.style.width = Math.max(2, Math.min(100, row.tuneProgressPct)) + '%'
        barWrap.appendChild(fill)
        popover.el.appendChild(barWrap)
      }
      var hint = document.createElement('small')
      hint.textContent = '完整面板：设置 → 性格管理（预设库/统计/定时/导入导出）'
      popover.el.appendChild(hint)
      // 定位：锚点左对齐，浮在锚点上方；clamp 到视口内。
      var rect = anchorEl.getBoundingClientRect()
      var left = Math.max(8, Math.min(rect.left, (window.innerWidth || 1200) - 316))
      var bottom = (window.innerHeight || 800) - rect.top + 8
      popover.el.style.left = left + 'px'
      popover.el.style.bottom = bottom + 'px'
    }

    function togglePopover(anchorEl) {
      if (popover.open) {
        closePopover()
        return
      }
      popover.anchor = anchorEl
      popover.open = true
      renderPopoverInto(anchorEl)
    }

    // 点击浮层外任意位置关闭（只挂一个委托监听）。
    function onDocumentPointerDown(event) {
      if (!popover.open) return
      var target = event.target
      var inside = popover.el !== null && popover.el.contains(target)
      var onAnchor = popover.anchor !== null && popover.anchor.contains(target)
      if (!inside && !onAnchor) closePopover()
    }

    /* ---------------------------------------------------------------- */
    /* React 小工具                                                      */
    /* ---------------------------------------------------------------- */

    function h(tag, props) {
      var children = []
      for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i]
        if (child === null || child === undefined || child === false) continue
        children.push(child)
      }
      if (props === null || props === undefined) props = {}
      if (children.length === 0) return React.createElement(tag, props)
      return React.createElement.apply(null, [tag, props].concat(children))
    }

    function useSnapshot() {
      return React.useSyncExternalStore(store.subscribe, store.getSnapshot)
    }

    function cls() {
      return Array.prototype.filter.call(arguments, Boolean).join(' ')
    }

    function Field(props) {
      var label = props.label
      var control = props.control
      var hint = props.hint
      return h('label', { className: 'wp-row', style: { alignItems: 'flex-start' } },
        h('span', { style: { minWidth: 88, fontSize: 13, color: 'var(--dsw-alias-label-secondary,#555)' } }, label),
        control,
        hint ? h('small', null, hint) : null,
      )
    }

    function TextInput(props) {
      return h('input', {
        className: 'wp-input',
        type: 'text',
        value: props.value,
        placeholder: props.placeholder || '',
        style: props.style,
        onChange: function (event) { props.onChange(event.currentTarget.value) },
      })
    }

    function TextArea(props) {
      return h('textarea', {
        className: 'wp-textarea',
        rows: props.rows || 3,
        value: props.value,
        placeholder: props.placeholder || '',
        onChange: function (event) { props.onChange(event.currentTarget.value) },
      })
    }

    function Select(props) {
      return h('select', {
        className: 'wp-select',
        value: props.value,
        onChange: function (event) { props.onChange(event.currentTarget.value) },
      }, (props.options || []).map(function (option) {
        return h('option', { key: option.value, value: option.value }, option.label)
      }))
    }

    function Slider(props) {
      return h('input', {
        className: 'wp-range',
        type: 'range',
        min: props.min,
        max: props.max,
        step: props.step,
        value: String(props.value),
        onChange: function (event) { props.onChange(Number(event.currentTarget.value)) },
      })
    }

    function parseLines(text) {
      return String(text || '').split(/\r?\n/).map(function (line) { return line.trim() }).filter(Boolean)
    }

    function downloadJson(filename, obj) {
      var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
      var url = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      setTimeout(function () {
        if (a.parentNode !== null) a.parentNode.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    }

    /* ---------------------------------------------------------------- */
    /* 侧栏底部「性格状态」条目                                          */
    /* ---------------------------------------------------------------- */

    function BadgeChip() {
      var snap = useSnapshot()
      var chipRef = React.useRef(null)
      // 快照变化时若浮层开着，刷新内容；组件卸载时关闭浮层。
      React.useEffect(function () {
        if (popover.open && popover.anchor !== null) renderPopoverInto(popover.anchor)
      }, [snap])
      React.useEffect(function () {
        return function () {
          if (popover.anchor !== null && popover.anchor === chipRef.current) closePopover()
        }
      }, [])
      if (snap === null) return null
      var active = snap.active
      var label = active && snap.enabled ? (active.icon || '🐋') + ' ' + active.name : '性格未启用'
      return h('button', {
        ref: chipRef,
        type: 'button',
        className: cls('wp-footer-chip', (!snap.enabled || active === null) ? 'wp-footer-chip-off' : ''),
        title: '性格状态：' + label + (snap.mood ? '（' + snap.mood.emoji + ' ' + snap.mood.label + '）' : ''),
        'data-whale-chip': '',
        onClick: function (event) {
          togglePopover(event.currentTarget)
        },
      }, label)
    }

    /* ---------------------------------------------------------------- */
    /* 设置面板：性格管理                                                */
    /* ---------------------------------------------------------------- */

    var EDITOR_TEMPLATE = {
      id: '',
      name: '',
      icon: '🐋',
      category: 'custom',
      tags: '',
      keywords: '',
      coreTraits: '',
      styleRules: '',
      sampleLines: '',
      greeting: '',
      farewell: '',
      systemPrompt: '',
      temperature: 0.85,
      topP: 0.9,
      maxTokens: 2048,
      intensity: 2,
      conflictsWith: '',
    }

    function personaToEditor(persona) {
      return {
        id: persona.id,
        name: persona.name,
        icon: persona.icon,
        category: persona.category || 'custom',
        tags: (persona.tags || []).join('\n'),
        keywords: (persona.keywords || []).join('\n'),
        coreTraits: (persona.coreTraits || []).join('\n'),
        styleRules: (persona.styleRules || []).join('\n'),
        sampleLines: (persona.sampleLines || []).join('\n'),
        greeting: persona.greeting || '',
        farewell: persona.farewell || '',
        systemPrompt: persona.systemPrompt || '',
        temperature: persona.params.temperature,
        topP: persona.params.topP,
        maxTokens: persona.params.maxTokens,
        intensity: persona.intensity,
        conflictsWith: (persona.conflictsWith || []).join(', '),
      }
    }

    function editorToPersona(editor) {
      return {
        id: editor.id || undefined,
        name: editor.name.trim(),
        icon: editor.icon.trim() || '🐋',
        category: editor.category,
        tags: parseLines(editor.tags),
        keywords: parseLines(editor.keywords),
        coreTraits: parseLines(editor.coreTraits),
        styleRules: parseLines(editor.styleRules),
        sampleLines: parseLines(editor.sampleLines),
        greeting: editor.greeting,
        farewell: editor.farewell,
        systemPrompt: editor.systemPrompt,
        params: {
          temperature: Number(editor.temperature),
          topP: Number(editor.topP),
          maxTokens: Number(editor.maxTokens),
        },
        intensity: Number(editor.intensity),
        conflictsWith: String(editor.conflictsWith || '').split(/[,，\s]+/).map(function (item) { return item.trim() }).filter(Boolean),
      }
    }

    function EditorCard(props) {
      var snap = useSnapshot()
      var state = React.useState(props.initial)
      var editor = state[0]
      var setEditor = state[1]
      var saving = React.useState(false)
      var savingFlag = saving[0]
      var setSaving = saving[1]
      var set = function (key) {
        return function (value) { setEditor(Object.assign({}, editor, key ? { [key]: value } : value)) }
      }
      var categoryOptions = Object.keys(snap ? snap.categoryNames || {} : {}).map(function (key) {
        return { value: key, label: (snap.categoryNames || {})[key] }
      })
      var templateOptions = [{ value: '', label: '空白模板' }].concat((snap ? snap.builtinCatalog || [] : []).map(function (p) {
        return { value: p.id, label: p.icon + ' 从「' + p.name + '」模板创建' }
      }))
      return h('div', { className: 'wp-card' },
        h('h3', null, props.title || '编辑性格'),
        h('div', { className: 'wp-row' },
          h('label', null, '从预设创建'),
          h('select', {
            className: 'wp-select',
            value: '',
            onChange: function (event) {
              var id = event.currentTarget.value
              if (id === '') return
              var template = (snap ? snap.personas || [] : []).find(function (p) { return p.id === id })
              if (!template) return
              var copy = personaToEditor(template)
              copy.id = ''
              copy.name = template.name + '（我的定制）'
              setEditor(copy)
              event.currentTarget.value = ''
            },
          }, templateOptions.map(function (option) {
            return h('option', { key: option.value, value: option.value }, option.label)
          })),
        ),
        Field({ label: '名称', control: TextInput({ value: editor.name, onChange: set('name'), placeholder: '如：软萌小鲸 / 冷酷总裁 / 元气学姐…' }) }),
        Field({ label: '图标', control: TextInput({ value: editor.icon, onChange: set('icon'), style: { width: 90 }, placeholder: 'emoji' }) }),
        Field({ label: '分类', control: Select({ value: editor.category, onChange: set('category'), options: categoryOptions }) }),
        Field({ label: '标签', control: TextArea({ value: editor.tags, onChange: set('tags'), rows: 2, placeholder: '每行一个，如：软萌 / 温柔 / 迷糊' }) }),
        Field({ label: '口头禅', control: TextArea({ value: editor.keywords, onChange: set('keywords'), rows: 2, placeholder: '每行一个关键词' }) }),
        Field({ label: '性格特征', control: TextArea({ value: editor.coreTraits, onChange: set('coreTraits'), rows: 3, placeholder: '每行一条核心性格' }) }),
        Field({ label: '说话风格', control: TextArea({ value: editor.styleRules, onChange: set('styleRules'), rows: 3, placeholder: '每行一条风格规则' }) }),
        Field({ label: '示例台词', control: TextArea({ value: editor.sampleLines, onChange: set('sampleLines'), rows: 3, placeholder: '每行一句示例（用于预览）' }) }),
        Field({ label: '问候语', control: TextInput({ value: editor.greeting, onChange: set('greeting'), placeholder: '切换到此性格时的问候' }) }),
        Field({ label: '告别语', control: TextInput({ value: editor.farewell, onChange: set('farewell'), placeholder: '切走时的告别' }) }),
        Field({ label: '系统提示词', control: TextArea({ value: editor.systemPrompt, onChange: set('systemPrompt'), rows: 8, placeholder: '完整人设文本（会作为系统提示词注入）' }) }),
        Field({
          label: '强度',
          control: Select({
            value: String(editor.intensity),
            onChange: function (value) { set('intensity')(Number(value)) },
            options: [{ value: '1', label: '1 温和' }, { value: '2', label: '2 标准' }, { value: '3', label: '3 极端' }],
          }),
          hint: '温和模式收敛夸张；极端模式全力沉浸演绎',
        }),
        Field({
          label: 'temperature',
          control: h('span', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8 } },
            Slider({ min: 0.2, max: 1.6, step: 0.05, value: editor.temperature, onChange: set('temperature') }),
            h('span', { className: 'wp-mini' }, String(editor.temperature)),
          ),
        }),
        Field({
          label: 'top_p',
          control: h('span', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8 } },
            Slider({ min: 0.1, max: 1, step: 0.05, value: editor.topP, onChange: set('topP') }),
            h('span', { className: 'wp-mini' }, String(editor.topP)),
          ),
        }),
        Field({
          label: 'max_tokens',
          control: Select({
            value: String(editor.maxTokens),
            onChange: function (value) { set('maxTokens')(Number(value)) },
            options: [512, 1024, 2048, 4096, 8192].map(function (n) { return { value: String(n), label: String(n) } }),
          }),
          hint: '性格模板参数（当前 DSH 部署中作为性格元数据展示与进化调节）',
        }),
        Field({ label: '互斥性格', control: TextInput({ value: editor.conflictsWith, onChange: set('conflictsWith'), placeholder: '逗号分隔的性格 id' }), hint: '与这些性格混合/相邻切换时会给出冲突提示' }),
        h('div', { className: 'wp-row' },
          h('button', {
            type: 'button',
            className: 'wp-btn wp-btn-primary',
            disabled: savingFlag,
            onClick: function () {
              setSaving(true)
              var payload = { action: 'save', persona: editorToPersona(editor) }
              apiPost(payload).then(function (data) {
                store.set(data.state)
                showToast(props.isNew ? '新性格已创建 ✨' : '性格已保存 ✨')
                if (props.onDone) props.onDone()
              }).catch(function (err) { showToast('保存失败', err.message) }).finally(function () { setSaving(false) })
            },
          }, savingFlag ? '保存中…' : '保存'),
          props.onCancel ? h('button', { type: 'button', className: 'wp-btn', onClick: props.onCancel }, '取消') : null,
        ),
      )
    }

    function MixControls(props) {
      var snap = useSnapshot()
      var state = React.useState({ subId: snap && snap.mix ? snap.mix.subId || '' : '', ratio: snap && snap.mix ? snap.mix.ratio || 0 : 0 })
      var mix = state[0]
      var setMixState = state[1]
      React.useEffect(function () {
        if (snap && snap.mix) setMixState({ subId: snap.mix.subId || '', ratio: snap.mix.ratio || 0 })
      }, [snap && snap.mix && snap.mix.subId, snap && snap.mix && snap.mix.ratio])
      if (snap === null) return null
      var personaOptions = (snap.personas || [])
        .filter(function (p) { return p.id !== snap.activeId })
        .map(function (p) { return { value: p.id, label: p.icon + ' ' + p.name } })
      var conflictList = snap.conflicts || []
      return h('div', { className: 'wp-card' },
        h('h3', null, '混合模式（主性格 + 子性格）'),
        h('small', null, '以当前主性格为基础，混入子性格的某些特征；比例越高子性格特征越明显。例如 软萌为主 + 傲娇为辅 = 软萌中带点小傲娇。'),
        h('div', { className: 'wp-row', style: { marginTop: 8 } },
          Field({
            label: '子性格',
            control: Select({
              value: mix.subId,
              onChange: function (value) { setMixState(Object.assign({}, mix, { subId: value })) },
              options: [{ value: '', label: '无（关闭混合）' }].concat(personaOptions),
            }),
          }),
        ),
        h('div', { className: 'wp-row' },
          Field({
            label: '混入比例',
            control: h('span', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8 } },
              Slider({ min: 0, max: 100, step: 5, value: mix.ratio, onChange: function (value) { setMixState(Object.assign({}, mix, { ratio: value })) } }),
              h('span', { className: 'wp-mini' }, mix.ratio + '%'),
            ),
          }),
        ),
        conflictList.length > 0
          ? h('div', { className: 'wp-warn' }, conflictList.map(function (conflict, index) {
              return h('div', { key: index },
                '⚠️ 冲突（' + (conflict.severity === 'high' ? '高' : conflict.severity === 'medium' ? '中' : '低') + '）：' + conflict.reason,
                h('small', null, '建议：' + conflict.suggestion),
              )
            }))
          : null,
        h('div', { className: 'wp-row' },
          h('button', {
            type: 'button',
            className: 'wp-btn wp-btn-primary',
            onClick: function () {
              setMix(mix.subId === '' ? null : mix.subId, mix.subId === '' ? 0 : mix.ratio)
            },
          }, '应用混合'),
          h('label', null, '允许冲突组合'),
          h('input', {
            type: 'checkbox',
            checked: snap.allowConflicts === true,
            onChange: function (event) {
              apiPost({ action: 'setAllowConflicts', allow: event.currentTarget.checked }).then(function (data) {
                store.set(data.state)
                showToast(event.currentTarget.checked ? '已允许冲突组合 ⚠️' : '已恢复冲突保护 🛡️')
              })
            },
          }),
          h('small', null, '开启后可启用高冲突的组合（如 雌小鬼+妈妈系），风险自负'),
        ),
      )
    }

    function CurrentPanel(props) {
      var snap = useSnapshot()
      if (snap === null) return h('div', { className: 'wp-card' }, h('small', null, '宿主插件未就绪…'))
      var active = snap.active
      return h('div', null,
        h('div', { className: 'wp-card' },
          h('div', { className: 'wp-row' },
            h('h3', { style: { margin: 0 } }, '当前状态'),
            h('button', {
              type: 'button',
              className: snap.enabled ? 'wp-btn wp-btn-danger' : 'wp-btn wp-btn-primary',
              onClick: function () { setEnabledFlag(!snap.enabled) },
            }, snap.enabled ? '关闭性格系统' : '开启性格系统'),
          ),
          snap.enabled === false
            ? h('small', null, '性格系统已关闭：系统提示词中不会注入任何性格文本。')
            : active === null
              ? h('small', null, '尚未启用性格。点击「性格预设库」中任一性格卡片「启用」即可。')
              : h('div', null,
                  h('div', { className: 'wp-row' },
                    h('span', { style: { fontSize: 24 } }, active.icon || '🐋'),
                    h('span', { style: { fontWeight: 600, fontSize: 15 } }, active.name),
                    h('span', { className: 'wp-chip' }, '主性格'),
                    h('span', { className: 'wp-chip wp-chip-cat' }, (snap.categoryNames || {})[active.category] || active.category),
                    snap.mix.subId
                      ? h('span', { className: 'wp-chip' }, '🧪 混入「' + snap.mix.subName + '」' + snap.mix.ratio + '%')
                      : null,
                  ),
                  h('small', null, '心情：' + (snap.mood ? snap.mood.emoji + ' ' + snap.mood.label : '—')),
                  snap.activity && snap.activity[active.id]
                    ? h('small', null, '进化倒计时：当前进度 ' + snap.activity[active.id].tuneProgressPct + '% · 距下次自动微调还差 ' + snap.activity[active.id].tuneRemainingText)
                    : null,
                  h('div', { className: 'wp-row', style: { marginTop: 8 } },
                    h('button', { type: 'button', className: 'wp-btn', onClick: function () { switchTo(null) } }, '停用性格'),
                    h('span', { className: 'wp-mini' }, '开启后立刻注入系统提示词，全局生效（含子代理）'),
                  ),
                ),
        ),
        snap.enabled && active !== null ? h(MixControls, null) : null,
      )
    }

    function PersonasPanel(props) {
      var snap = useSnapshot()
      var editing = React.useState(null)
      var editingId = editing[0]
      var setEditing = editing[1]
      var creating = React.useState(false)
      var creatingFlag = creating[0]
      var setCreating = creating[1]
      var filter = React.useState('all')
      var filterValue = filter[0]
      var setFilter = filter[1]
      if (snap === null) return h('div', { className: 'wp-card' }, h('small', null, '宿主插件未就绪…'))
      var personas = snap.personas || []
      var categories = []
      personas.forEach(function (p) {
        if (categories.indexOf(p.category) < 0) categories.push(p.category)
      })
      var filtered = filterValue === 'all' ? personas : personas.filter(function (p) { return p.category === filterValue })
      var categoryOptions = [{ value: 'all', label: '全部' }].concat(categories.map(function (key) {
        return { value: key, label: (snap.categoryNames || {})[key] || key }
      }))
      return h('div', null,
        h('div', { className: 'wp-card' },
          h('div', { className: 'wp-row' },
            h('h3', { style: { margin: 0 } }, '性格预设库（' + personas.length + '）'),
            h('button', { type: 'button', className: 'wp-btn wp-btn-primary', onClick: function () { setEditing(null); setCreating(true) } }, '＋ 新建性格'),
          ),
          h('small', null, '内置 12 个预设，覆盖萌系/傲娇系/雌小鬼系/妈妈系/病娇系/御姐系/冷酷系/天然系/元气系/温柔系/腹黑系/中二系/毒舌系；点击「启用」即作为系统提示词全局注入，「编辑」可微调名称、关键词、强度与参数。'),
          h('div', { className: 'wp-row', style: { marginTop: 8 } },
            categoryOptions.map(function (option) {
              return h('button', {
                key: option.value,
                type: 'button',
                className: cls('wp-tab', filterValue === option.value ? 'wp-tab-on' : ''),
                onClick: function () { setFilter(option.value) },
              }, option.label)
            }),
          ),
        ),
        creatingFlag ? h(EditorCard, { title: '新建性格', isNew: true, initial: Object.assign({}, EDITOR_TEMPLATE), onDone: function () { setCreating(false) }, onCancel: function () { setCreating(false) } }) : null,
        h('div', { className: 'wp-grid' },
          filtered.map(function (persona) {
            var active = snap.activeId === persona.id
            if (editingId === persona.id) {
              return h('div', { key: persona.id, style: { gridColumn: '1 / -1' } },
                h(EditorCard, {
                  title: '编辑「' + persona.name + '」',
                  isNew: false,
                  initial: personaToEditor(persona),
                  onDone: function () { setEditing(null) },
                  onCancel: function () { setEditing(null) },
                }),
              )
            }
            var activity = (snap.activity || {})[persona.id]
            return h('div', { key: persona.id, className: cls('wp-tile', active ? 'wp-tile-active' : '') },
              h('div', { className: 'wp-row' },
                h('span', { style: { fontSize: 22 } }, persona.icon || '🐋'),
                h('span', { style: { fontWeight: 600 } }, persona.name),
                persona.builtin ? h('span', { className: 'wp-chip' }, '内置') : null,
              ),
              h('div', null,
                h('span', { className: 'wp-chip wp-chip-cat' }, (snap.categoryNames || {})[persona.category] || persona.category),
                (persona.tags || []).map(function (tag) {
                  return h('span', { key: tag, className: 'wp-chip' }, tag)
                }),
              ),
              h('small', null,
                '强度：' + ((snap.intensityNames || {})[persona.intensity] || persona.intensity) +
                ' · t=' + persona.params.temperature + ' · top_p=' + persona.params.topP + ' · max=' + persona.params.maxTokens),
              activity ? h('small', null,
                '今日 ' + activity.todayText + ' · 累计 ' + activity.totalText + ' · 切换 ' + activity.switches + ' 次' +
                ' · 进化 ' + activity.tuneCount + ' 次（进度 ' + activity.tuneProgressPct + '%）') : null,
              h('div', { className: 'wp-row', style: { marginTop: 8 } },
                h('button', {
                  type: 'button',
                  className: 'wp-btn' + (active ? ' wp-btn-primary' : ''),
                  onClick: function () { switchTo(persona.id) },
                }, active ? '当前启用' : '启用'),
                h('button', { type: 'button', className: 'wp-btn', onClick: function () { setEditing(persona.id); setCreating(false) } }, '编辑'),
                h('button', {
                  type: 'button',
                  className: 'wp-btn',
                  onClick: function () {
                    apiPost({ action: 'duplicate', id: persona.id }).then(function (data) {
                      store.set(data.state)
                      showToast('已复制性格 📋', '「' + persona.name + '·副本」已创建')
                    }).catch(function (err) { showToast('复制失败', err.message) })
                  },
                }, '复制'),
                h('button', {
                  type: 'button',
                  className: 'wp-btn',
                  onClick: function () { downloadJson('whale-persona-' + persona.id + '.json', { dshWhalePersona: 1, persona: persona }) },
                }, '导出'),
                h('button', {
                  type: 'button',
                  className: 'wp-btn wp-btn-danger',
                  onClick: function () {
                    var note = persona.builtin ? '删除内置性格「' + persona.name + '」？之后可在「性格预设库」中恢复。' : '删除性格「' + persona.name + '」？此操作不可恢复。'
                    if (!window.confirm(note)) return
                    apiPost({ action: 'delete', id: persona.id }).then(function (data) {
                      store.set(data.state)
                      showToast('已删除「' + persona.name + '」🗑️')
                    }).catch(function (err) { showToast('删除失败', err.message) })
                  },
                }, '删除'),
              ),
              persona.sampleLines && persona.sampleLines.length > 0
                ? h('div', { style: { marginTop: 8 } },
                    h('small', { style: { marginBottom: 4 } }, '预览示例：'),
                    persona.sampleLines.slice(0, 3).map(function (line, index) {
                      return h('div', { key: index, className: 'wp-bubble' }, persona.icon + '　' + line)
                    }),
                  )
                : null,
            )
          }),
        ),
        (snap.deletedBuiltins || []).length > 0
          ? h('div', { className: 'wp-card' },
              h('h3', null, '已删除的内置预设'),
              h('div', { className: 'wp-row' },
                (snap.deletedBuiltins || []).map(function (id) {
                  var template = (snap.builtinCatalog || []).find(function (p) { return p.id === id })
                  if (!template) return null
                  return h('button', {
                    key: id,
                    type: 'button',
                    className: 'wp-btn',
                    onClick: function () {
                      apiPost({ action: 'restore', id: id }).then(function (data) {
                        store.set(data.state)
                        showToast('已恢复内置预设 🔄', template.icon + ' 「' + template.name + '」')
                      }).catch(function (err) { showToast('恢复失败', err.message) })
                    },
                  }, '恢复 ' + template.icon + ' ' + template.name)
                }),
              ),
            )
          : null,
      )
    }

    function StatsPanel() {
      var snap = useSnapshot()
      var report = React.useState(null)
      var reportValue = report[0]
      var setReport = report[1]
      if (snap === null) return h('div', { className: 'wp-card' }, h('small', null, '宿主插件未就绪…'))
      var rows = Object.values(snap.activity || {}).sort(function (a, b) { return b.totalMs - a.totalMs })
      return h('div', { className: 'wp-card' },
        h('div', { className: 'wp-row' },
          h('h3', { style: { margin: 0 } }, '使用统计与进化报告'),
          h('button', {
            type: 'button',
            className: 'wp-btn wp-btn-primary',
            onClick: function () {
              apiPost({ action: 'report' }).then(function (data) {
                setReport(data.report)
                store.set(data.state)
              }).catch(function (err) { showToast('报告生成失败', err.message) })
            },
          }, '生成报告'),
        ),
        h('small', null, '累计使用每满 2 小时自动微调一次参数（高频性格更"浓"，低频收敛）；进度条显示当前 2 小时块内的进化进度。'),
        rows.length === 0 ? h('small', null, '暂无使用记录。') : rows.map(function (row) {
          return h('div', { key: row.id, style: { marginBottom: 12 } },
            h('div', { className: 'wp-row' },
              h('span', null, row.icon + ' ' + row.name),
              h('span', { className: 'wp-mini' }, '今日 ' + row.todayText + ' · 累计 ' + row.totalText + ' · 切换 ' + row.switches + ' 次 · 连续 ' + row.streakDays + ' 天'),
            ),
            h('div', { className: 'wp-bar' },
              h('div', { className: 'wp-bar-fill', style: { width: Math.max(2, Math.min(100, row.tuneProgressPct)) + '%' } }),
            ),
            h('div', { className: 'wp-row', style: { marginTop: 4, marginBottom: 0 } },
              h('span', { className: 'wp-mini' }, '当前进度 ' + row.tuneProgressPct + '% · 距下次微调还差 ' + row.tuneRemainingText),
              h('span', { className: 'wp-mini' }, '使用占比 ' + row.share + '% · 好感度 ' + row.affinity + (row.tuneCount > 0 ? ' · 已进化 ' + row.tuneCount + ' 次 ✨' : '')),
            ),
          )
        }),
        reportValue !== null
          ? h('div', { style: { marginTop: 12 } },
              h('textarea', { className: 'wp-textarea', rows: 16, readOnly: true, value: reportValue.text, onFocus: function (event) { event.currentTarget.select() } }),
              h('div', { className: 'wp-row', style: { marginTop: 8 } },
                h('button', {
                  type: 'button',
                  className: 'wp-btn',
                  onClick: function () {
                    navigator.clipboard && navigator.clipboard.writeText(reportValue.text).then(function () { showToast('报告已复制 📋') }).catch(function () { showToast('复制失败') })
                  },
                }, '复制报告'),
              ),
            )
          : null,
      )
    }

    function SchedulerPanel() {
      var snap = useSnapshot()
      if (snap === null) return h('div', { className: 'wp-card' }, h('small', null, '宿主插件未就绪…'))
      var scheduler = snap.scheduler || { auto: false, graceMinutes: 15, rules: [], holidays: [] }
      var personaOptions = (snap.personas || []).map(function (p) { return { value: p.id, label: p.icon + ' ' + p.name } })
      var saveScheduler = function (patch) {
        var next = Object.assign({}, scheduler, patch)
        apiPost({ action: 'setScheduler', scheduler: next }).then(function (data) {
          store.set(data.state)
        }).catch(function (err) { showToast('保存定时器失败', err.message) })
      }
      var DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
      var nextAuto = snap.nextAuto
      return h('div', null,
        h('div', { className: 'wp-card' },
          h('div', { className: 'wp-row' },
            h('h3', { style: { margin: 0 } }, '性格定时器（自动切换）'),
            h('input', {
              type: 'checkbox',
              checked: scheduler.auto === true,
              onChange: function (event) { saveScheduler({ auto: event.currentTarget.checked }) },
            }),
            h('label', null, '启用自动切换'),
          ),
          h('small', null, '手动切换后有 ' + scheduler.graceMinutes + ' 分钟宽限期，期间定时器不干预；节日规则优先于时段规则。'),
          nextAuto
            ? h('div', { className: 'wp-warn' }, '⏰ 下次自动切换：' + new Date(nextAuto.at).toLocaleString('zh-CN') + ' → 「' + ((snap.personas || []).find(function (p) { return p.id === nextAuto.targetId }) || {}).name + '」')
            : h('small', null, '当前没有即将发生的自动切换。'),
        ),
        h('div', { className: 'wp-card' },
          h('h3', null, '时段规则（如：工作日高效模式 / 周末懒散模式）'),
          (scheduler.rules || []).map(function (rule, index) {
            var patchRule = function (changes) {
              var rules = scheduler.rules.slice()
              rules[index] = Object.assign({}, rule, changes)
              saveScheduler({ rules: rules })
            }
            return h('div', { key: rule.id || index, className: 'wp-row', style: { alignItems: 'flex-end' } },
              TextInput({ value: rule.name || '', placeholder: '规则名', style: { width: 140 }, onChange: function (value) { patchRule({ name: value }) } }),
              h('select', { className: 'wp-select', value: rule.personaId || '', onChange: function (event) { patchRule({ personaId: event.currentTarget.value }) } },
                h('option', { value: '' }, '选择性格'),
                personaOptions.map(function (option) { return h('option', { key: option.value, value: option.value }, option.label) }),
              ),
              h('div', { className: 'wp-days' }, DAY_NAMES.map(function (name, day) {
                var on = (rule.days || []).includes(day)
                return h('button', {
                  key: day,
                  type: 'button',
                  className: on ? 'wp-day-on' : '',
                  title: '周' + name,
                  onClick: function () {
                    var days = on ? (rule.days || []).filter(function (d) { return d !== day }) : (rule.days || []).concat([day])
                    patchRule({ days: days })
                  },
                }, name)
              })),
              h('input', { className: 'wp-input', type: 'time', value: rule.start || '09:00', onChange: function (event) { patchRule({ start: event.currentTarget.value }) } }),
              h('span', null, '—'),
              h('input', { className: 'wp-input', type: 'time', value: rule.end || '18:00', onChange: function (event) { patchRule({ end: event.currentTarget.value }) } }),
              h('button', {
                type: 'button',
                className: 'wp-btn wp-btn-danger',
                onClick: function () {
                  var rules = scheduler.rules.slice()
                  rules.splice(index, 1)
                  saveScheduler({ rules: rules })
                },
              }, '删除'),
            )
          }),
          h('div', { className: 'wp-row' },
            h('button', {
              type: 'button',
              className: 'wp-btn',
              onClick: function () {
                saveScheduler({ rules: (scheduler.rules || []).concat([{ id: 'rule-' + Date.now(), enabled: true, name: '新规则', personaId: '', days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' }]) })
              },
            }, '＋ 添加时段规则'),
            h('small', null, '支持跨午夜（如 22:00—07:00）；时间按"开始包含、结束不包含"计算。'),
          ),
        ),
        h('div', { className: 'wp-card' },
          h('h3', null, '节日限定性格（圣诞节限定、春节限定…）'),
          (scheduler.holidays || []).map(function (holiday, index) {
            var patchHoliday = function (changes) {
              var holidays = scheduler.holidays.slice()
              holidays[index] = Object.assign({}, holiday, changes)
              saveScheduler({ holidays: holidays })
            }
            return h('div', { key: holiday.id || index, className: 'wp-row' },
              TextInput({ value: holiday.name || '', placeholder: '如：圣诞节限定', style: { width: 150 }, onChange: function (value) { patchHoliday({ name: value }) } }),
              h('select', { className: 'wp-select', value: holiday.personaId || '', onChange: function (event) { patchHoliday({ personaId: event.currentTarget.value }) } },
                h('option', { value: '' }, '选择性格'),
                personaOptions.map(function (option) { return h('option', { key: option.value, value: option.value }, option.label) }),
              ),
              h('select', { className: 'wp-select', value: (holiday.monthDay || '').slice(0, 2), onChange: function (event) { patchHoliday({ monthDay: event.currentTarget.value + '-' + ((holiday.monthDay || '01-01').slice(3)) }) } },
                Array.from({ length: 12 }, function (_, i) { return h('option', { key: i, value: String(i + 1).padStart(2, '0') }, (i + 1) + ' 月') }),
              ),
              h('select', { className: 'wp-select', value: (holiday.monthDay || '').slice(3), onChange: function (event) { patchHoliday({ monthDay: (holiday.monthDay || '01-01').slice(0, 2) + '-' + event.currentTarget.value }) } },
                Array.from({ length: 31 }, function (_, i) { return h('option', { key: i, value: String(i + 1).padStart(2, '0') }, (i + 1) + ' 日') }),
              ),
              h('button', {
                type: 'button',
                className: 'wp-btn wp-btn-danger',
                onClick: function () {
                  var holidays = scheduler.holidays.slice()
                  holidays.splice(index, 1)
                  saveScheduler({ holidays: holidays })
                },
              }, '删除'),
            )
          }),
          h('div', { className: 'wp-row' },
            h('button', {
              type: 'button',
              className: 'wp-btn',
              onClick: function () {
                saveScheduler({ holidays: (scheduler.holidays || []).concat([{ id: 'holiday-' + Date.now(), enabled: true, name: '节日限定', personaId: '', monthDay: '12-25' }]) })
              },
            }, '＋ 添加节日限定'),
            h('small', null, '节日当天全天生效（优先级高于时段规则）。'),
          ),
        ),
      )
    }

    function ImportExportPanel() {
      var snap = useSnapshot()
      var fileRef = React.useRef(null)
      var paste = React.useState('')
      var pasteValue = paste[0]
      var setPaste = paste[1]
      var result = React.useState(null)
      var resultValue = result[0]
      var setResult = result[1]
      var busy = React.useState(false)
      var busyFlag = busy[0]
      var setBusy = busy[1]
      if (snap === null) return h('div', { className: 'wp-card' }, h('small', null, '宿主插件未就绪…'))
      var importItems = function (items) {
        setBusy(true)
        return apiPost({ action: 'import', items: items }).then(function (data) {
          store.set(data.state)
          var count = (data.imported || []).length
          var names = (data.imported || []).map(function (i) { return i.name }).join('、')
          setResult({ ok: true, text: '✅ 成功导入 ' + count + ' 个性格：' + names + '（可在「性格预设库 → 全部」中看到）' })
          showToast('导入成功 📥', '新增 ' + count + ' 个性格：' + names, 6000)
          setPaste('')
        }).catch(function (err) {
          setResult({ ok: false, text: '❌ 导入失败：' + err.message + '。支持：① 本插件导出的 JSON；② {personas:[…]} 合集；③ 单性格对象（至少含 name 与 systemPrompt）。' })
          showToast('导入失败', err.message, 8000)
        }).finally(function () { setBusy(false) })
      }
      var parseAndImport = function (text) {
        var parsed
        try {
          parsed = JSON.parse(text)
        } catch (err) {
          setResult({ ok: false, text: '❌ JSON 解析失败：' + err.message + '。文件必须是合法 JSON；如果你复制的是 index.js 里的代码，请把其中的 systemPrompt 文本粘到「性格预设库 → 新建性格」。' })
          showToast('JSON 解析失败', err.message, 8000)
          return
        }
        if (Array.isArray(parsed)) return importItems(parsed)
        if (parsed && Array.isArray(parsed.personas)) return importItems(parsed.personas)
        if (parsed && parsed.persona) return importItems([parsed.persona])
        var promptField = parsed && (parsed.systemPrompt || parsed.system_prompt || parsed.prompt)
        if (parsed && typeof promptField === 'string' && promptField.trim() !== '') return importItems([parsed])
        // 原始模板的 package.json（只有包名等清单信息，没有人设文本）
        if (parsed && typeof parsed.name === 'string' && parsed.dsh && parsed.dsh.type === 'preset') {
          setResult({ ok: false, text: '❌ 这是 package.json（插件包清单），不含人设文本。请在「性格预设库」中「导出」得到标准模板，或点下方「填入示例」照着填一份。' })
          showToast('格式无法识别', 'package.json 不含人设文本', 8000)
          return
        }
        if (parsed && typeof parsed.name === 'string' && parsed.category === 'character_preset') {
          setResult({ ok: false, text: '❌ 这是性格模板清单，但缺少人设文本字段（需要 system_prompt 或 systemPrompt）。请补充后再导入。' })
          showToast('格式无法识别', '缺少 system_prompt 人设文本字段', 8000)
          return
        }
        setResult({ ok: false, text: '❌ 格式无法识别：至少需要 name + systemPrompt（或 system_prompt）字段。可点「填入示例」查看标准格式。' })
        showToast('格式无法识别', '点「填入示例」查看支持的 JSON 格式', 8000)
      }
      var fillSample = function () {
        var sample = {
          dshWhalePersona: 1,
          persona: {
            name: '示例性格',
            icon: '🐟',
            category: 'custom',
            tags: ['示例'],
            keywords: ['嗨～'],
            coreTraits: ['温和有礼'],
            styleRules: ['句尾加"～"'],
            sampleLines: ['你好呀～'],
            greeting: '来啦？',
            farewell: '拜拜～',
            systemPrompt: '【角色设定】\n你是示例性格。\n\n【说话风格】\n- 温和有礼\n\n【启动指令】\n现在你就是示例性格，回复我。',
            params: { temperature: 0.8, topP: 0.9, maxTokens: 2048 },
            intensity: 2,
            conflictsWith: [],
          },
        }
        setPaste(JSON.stringify(sample, null, 2))
        setResult(null)
      }
      return h('div', { className: 'wp-card' },
        h('h3', null, '性格模板导入 / 导出'),
        h('small', null, '支持的格式：① 本插件「导出」的 JSON（单性格或 {personas:[…]} 合集）；② 你自己写的单性格对象（至少含 name 与 systemPrompt / system_prompt，可带 config.temperature / top_p / max_tokens、icon、category、tags、keywords、coreTraits、styleRules、sampleLines、intensity、conflictsWith）。'),
        h('div', { className: 'wp-row', style: { marginTop: 8 } },
          h('button', {
            type: 'button',
            className: 'wp-btn wp-btn-primary',
            onClick: function () {
              downloadJson('whale-persona-bundle.json', { dshWhalePersona: 1, personas: snap.personas || [] })
            },
          }, '导出全部性格'),
          h('button', { type: 'button', className: 'wp-btn', onClick: function () { if (fileRef.current) fileRef.current.click() } }, '从文件导入'),
          h('button', { type: 'button', className: 'wp-btn', onClick: fillSample }, '填入示例'),
          h('input', {
            ref: fileRef,
            type: 'file',
            accept: '.json,application/json',
            style: { display: 'none' },
            onChange: function (event) {
              var file = event.currentTarget.files && event.currentTarget.files[0]
              if (!file) return
              var reader = new FileReader()
              reader.onload = function () { parseAndImport(String(reader.result || '')) }
              reader.readAsText(file)
              event.currentTarget.value = ''
            },
          }),
        ),
        resultValue !== null
          ? h('div', { className: resultValue.ok ? 'wp-ok' : 'wp-warn', style: { marginTop: 8 } }, resultValue.text)
          : null,
        h('div', { style: { marginTop: 8 } },
          TextArea({ value: pasteValue, onChange: setPaste, rows: 8, placeholder: '或粘贴性格 JSON 到这里…（导入结果会直接显示在下方）' }),
        ),
        h('div', { className: 'wp-row', style: { marginTop: 8 } },
          h('button', {
            type: 'button',
            className: 'wp-btn wp-btn-primary',
            disabled: pasteValue.trim() === '' || busyFlag,
            onClick: function () { parseAndImport(pasteValue) },
          }, busyFlag ? '导入中…' : '导入粘贴内容'),
        ),
      )
    }

    function PersonaManager() {
      var tab = React.useState('current')
      var tabValue = tab[0]
      var setTab = tab[1]
      var TABS = [
        { id: 'current', label: '当前与混合' },
        { id: 'personas', label: '性格预设库' },
        { id: 'stats', label: '统计报告' },
        { id: 'schedule', label: '定时切换' },
        { id: 'io', label: '导入导出' },
      ]
      return h('div', { className: 'wp-root', 'data-whale-manager': '' },
        h('header', null,
          h('h2', { style: { margin: '0 0 6px' } }, '性格管理'),
          h('p', { className: 'wp-mini', style: { margin: '0 0 12px' } }, '启用一个性格后，它会作为系统提示词全局注入（含子代理）。内置 12 个分类预设可随意挑选微调；侧栏底部有性格状态条目，点击可快捷切换与混合。'),
        ),
        h('div', { className: 'wp-tabs' }, TABS.map(function (item) {
          return h('button', {
            key: item.id,
            type: 'button',
            className: cls('wp-tab', tabValue === item.id ? 'wp-tab-on' : ''),
            onClick: function () { setTab(item.id) },
          }, item.label)
        })),
        tabValue === 'current' ? h(CurrentPanel, null) : null,
        tabValue === 'personas' ? h(PersonasPanel, null) : null,
        tabValue === 'stats' ? h(StatsPanel, null) : null,
        tabValue === 'schedule' ? h(SchedulerPanel, null) : null,
        tabValue === 'io' ? h(ImportExportPanel, null) : null,
      )
    }

    /* ---------------------------------------------------------------- */
    /* 插件注册                                                          */
    /* ---------------------------------------------------------------- */

    exports.name = 'ui-whale-persona'
    exports.inject = ['slots']

    exports.apply = function (ctx) {
      // DOM 层：提示条、浮层外点击关闭、轮询与心跳，随插件卸载清理。
      ctx.effect(function () {
        document.addEventListener('pointerdown', onDocumentPointerDown, true)
        startPolling()
        return function () {
          document.removeEventListener('pointerdown', onDocumentPointerDown, true)
          stopPolling()
          closePopover()
          toastStack.slice().forEach(function (node) {
            if (node.parentNode !== null) node.parentNode.removeChild(node)
          })
          toastStack = []
        }
      }, 'ui-whale-persona: dom layer')

      // 侧栏底部「性格状态」条目（原生布局位，不遮挡任何按钮）。
      ctx.slots.inject('sidebar.footer.action', function () {
        return ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'whale-persona',
          order: 5,
          inject: function () { return {} },
        }, BadgeChip)
      })

      // 设置 → 性格管理。
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-persona',
          order: 110,
          label: '性格管理',
          inject: function () { return {} },
        }, PersonaManager)
      })
    }

    return module.exports
  },
})
