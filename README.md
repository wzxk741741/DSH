# 🐋 dsh-whale-persona — DSH 可视化性格（人格）插件

把「性格」做成一个可开可关、可增删、可预览、可混合、可进化的 DSH 插件。
内置 **13 个分类预设**（萌系/傲娇系/雌小鬼系/妈妈系/病娇系/御姐系/冷酷系/
天然系/元气系/温柔系/腹黑系/中二系/毒舌系），启用后**作为系统提示词全局注入**
（含子代理），在聊天中途切换即时生效，无需重启。

## 十二组功能对照

| # | 功能 | 实现位置 |
|---|------|----------|
| 1 | 手动开关插件 | 设置面板「当前状态」/ 侧栏底部状态条目浮层 |
| 2 | 添加 / 删除性格 | 设置 → 性格管理 → 性格预设库（新建 / 复制 / 删除 / 恢复内置） |
| 3 | 作为全局系统提示词使用 | 宿主注册 `whale:persona` prompt section（order 0）+ `{{whale_persona}}` 变量，每轮渲染求值 |
| 4 | 性格预览 | 卡片内示例台词气泡 + 核心标签 chips + 参数（temperature / top_p / max_tokens / 强度） |
| 5 | 快速切换 | 侧栏底部「性格状态」条目 → 浮层快捷按钮 + 切换过渡提示（含性格问候语） |
| 6 | 主 / 子性格混合 | 「当前与混合」页 + 浮层：子性格选择 + 比例滑块 0–100% |
| 7 | 模板导入 / 导出 | 「导入导出」页：单性格 JSON / 合集 bundle / 文件导入 / 粘贴导入 |
| 8 | 学习进化 + 使用报告 | 累计使用每满 2 小时自动微调；进度条 + 倒计时；毒舌口吻报告 |
| 9 | 自定义 | 名称不限鲸鱼少女；分类 / 口头禅 / 风格关键词 / 强度（温和 / 标准 / 极端）可改 |
| 10 | 状态显示 | 侧栏底部状态条目：图标 + 名称 + 心情（随时段变化）+ 进化进度 |
| 11 | 冲突检测 | 分类矩阵 + 自定义互斥列表；高冲突阻断（可开关「允许冲突组合」）+ 建议 |
| 12 | 性格定时器 | 时段规则（工作日/周末）+ 节日限定（MM-DD，优先级更高）+ 手动切换宽限期 |

## 预设库（13 个内置预设）

🐋 软萌小鲸（萌系）· 😤 傲娇小鲸（傲娇系）· 😈 雌小鬼小鲸（雌小鬼系）·
💕 妈妈系小鲸（妈妈系）· 🔪 病娇大小姐（病娇系）· 🖤 冷酷御姐（御姐系）·
🧊 冰山女上司（冷酷系）· 🌸 天然呆少女（天然系）· ⚡ 元气少女（元气系）·
🍵 温柔学姐（温柔系）· 🎭 腹黑萝莉（腹黑系）· 🗡️ 中二病少女（中二系）·
🫖 毒舌女仆（毒舌系）

预设库按分类筛选，每个预设都可以「复制」后随意微调（名称、图标、标签、
口头禅、风格规则、强度、参数、互斥列表、完整人设文本）。

## 安装 / 更新

> `dsh plugin add` 要求用**绝对路径**（相对路径按 dsh 命令的调用目录解析，容易踩坑）。
> 下面的 `<路径>` 换成你机器上的实际位置，插件放在哪个盘、哪个目录都可以。

### 本地目录（开发者）

```bash
# Windows 示例（把路径换成你的实际目录）：
dsh plugin --profile web add C:\projects\dsh-whale-persona

# macOS / Linux 示例：
dsh plugin --profile web add /home/you/dsh-whale-persona

dsh plugin --profile web list          # 确认包已注册
dsh --profile web --dump-config        # 确认 whale-persona entry 已组合
```

### 从 GitHub 安装

```bash
git clone https://github.com/wzxk741741/DSH.git dsh-whale-persona
# 上面命令里的 dsh-whale-persona 是克隆到本地的文件夹名（可随意改），
# add 时填这个文件夹的绝对路径（Windows 斜杠方向都可以）：
dsh plugin --profile web add <clone 目录的绝对路径>/dsh-whale-persona
# 后续更新：cd 到 clone 目录执行 git pull，再重启 DSH
```

**代码更新**：link 安装的插件代码修改后需重启 DSH 生效（本 profile 的 HMR 已
禁用；纯客户端 `lib/client.js` 改动只需刷新页面）。`$DSH_HOME/whale-persona/store.json`
里的性格、统计、定时器设置会保留；历史版本遗留的 NaN 统计会在启动时自动修复
（并恢复被错误进化漂移的内置参数）。

## 使用

- **开关**：设置 → 性格管理 →「当前状态」主开关；或侧栏底部状态条目 → 浮层开关。
- **切换**：侧栏底部「性格状态」条目 → 浮层前四个性格按钮；或预设库卡片「启用」。
  切换有过渡提示（含性格问候语）。v0.2 起按需求移除了聊天输入区快捷条与
  Ctrl/Alt+数字快捷键。
- **混合**：先在「当前与混合」选主性格启用，再选子性格 + 比例滑块点「应用混合」。
  例：软萌为主 + 傲娇 40% = 软萌中带点小傲娇。
- **进化倒计时**：每个性格的统计行与浮层都显示「当前进度 X% · 距下次微调还差 Y」；
  累计使用每满 2 小时自动微调一次 temperature / top_p / 强度（高频更"浓"、
  低频收敛）。
- **使用报告**：统计报告页「生成报告」→ 雌小鬼（毒舌）口吻的锐评报告，
  可一键复制。
- **定时器**：手动切换后 15 分钟宽限期内定时器不干预；节日规则优先于时段规则。

## 冲突矩阵（内置）

| 组合 | 级别 | 说明 |
|------|------|------|
| 雌小鬼 + 妈妈系 | 高 | 嘲讽捉弄与宠溺唠叨语气相反（默认阻断，需开启「允许冲突组合」） |
| 雌小鬼 + 萌系 | 中 | 嚣张毒舌容易压过软萌温柔 |
| 病娇 + 温柔 / 妈妈系 | 中 | 占有欲与平和关怀互相挤压 |
| 冷酷 + 元气 | 中 | 反差过大互相稀释 |
| 傲娇 + 妈妈系 / 毒舌 + 温柔 | 低 | 语气互相拆台，建议低比例点缀 |

软萌 + 傲娇等互补搭配无冲突。自定义性格可在编辑器中声明互斥 id。

## 模板 JSON 格式（导入 / 导出）

```json
{ "dshWhalePersona": 1, "persona": { "name": "冷酷总裁", "icon": "🖤",
  "category": "custom", "tags": ["高冷", "效率"], "keywords": ["哼"],
  "coreTraits": ["话少但可靠"], "styleRules": ["只回答关键信息"],
  "sampleLines": ["说重点。"], "greeting": "进来。", "farewell": "…去吧。",
  "systemPrompt": "【角色设定】…", "params": { "temperature": 0.6,
  "topP": 0.8, "maxTokens": 2048 }, "intensity": 2, "conflictsWith": [] } }
```

支持别名与扩展（v0.3 起）：

- 人设文本字段：`systemPrompt` 或 `system_prompt` 或 `prompt`
- 参数字段：`params.temperature / topP / maxTokens` 或 `config.temperature / top_p / max_tokens`
- 未提供 `sampleLines` 时，自动从人设文本的【示例对话】里提取"角色：…"台词做预览
- 合集导出为 `{ "dshWhalePersona": 1, "personas": [ … ] }`；直接粘贴性格对象数组也可以

## 架构说明（开发者）

- **宿主半边 `lib/index.js`**（手写 ESM，无构建步骤）：cordis 插件
  `inject: ['systemPrompt', 'webServer']`。
  - 注入：`ctx.systemPrompt.section({ name: 'whale:persona', order: 0,
    text: '{{whale_persona}}' })` + `ctx.systemPrompt.variable('whale_persona',
    …)`。变量每轮组装时求值 → 中途切换即时生效；关闭时返回空串，空段渲染即删除，
    不占 token。人设文本作为变量值原样插入（替换值不再二次扫描，无 `{{}}`
    注入问题）。
  - 路由：`/api/dsh/persona`（GET 状态；POST 动作），同源校验 + 原子文件写入。
  - 状态：`$DSH_HOME/whale-persona/store.json`；损坏时自动备份并回退内置种子；
    非有限统计字段加载时强制归零（NaN 自愈），corrupt 签名的内置性格恢复模板参数。
- **浏览器半边 `lib/client.js`**：`window.__ModuleLoader__.load` 手写 bundle，
  仅外部依赖模块表 `react`。注册 `settings.section`（设置 → 性格管理）与
  `sidebar.footer.action`（侧栏底部性格状态条目 + 快捷浮层），提示条为 DOM 层
  实现，随插件卸载完整清理。CSS 变量全部走 `--dsw-*` 主题令牌，浮层
  z-index 940（< 1000，不压系统菜单）。
- **测试**：`node test/smoke.mjs`（预设/组装/混合/冲突/调度/NaN 防御/进度/报告）
  与 `node test/client-smoke.mjs`（工厂/apply/侧栏条目/浮层/切换/清理）。无需安装
  任何依赖，纯 Node ≥ 18 即可运行；`npm test` 一键跑全量（GitHub Actions 已配置）。

## 项目结构

```
dsh-whale-persona/
├── lib/
│   ├── index.js        # 宿主半边：系统提示词注入 + /api/dsh/persona 路由 + 调度/进化
│   └── client.js       # 浏览器半边：设置面板 + 侧栏状态条目/浮层 + 提示条（loader bundle）
├── cordis.patch.yml    # 插件注册 patch（insert whale-persona 行）
├── package.json        # 双面插件清单（dsh.bundle.patch + dsh.client）
├── scripts/
│   └── batch-add-thinking-rule.mjs   # 批量给全部性格追加「思考风格」规则（UTF-8 安全）
├── test/
│   ├── smoke.mjs            # 宿主逻辑冒烟测试
│   └── client-smoke.mjs     # 浏览器环境模拟冒烟测试（含 hooks 边界回归防线）
├── .github/workflows/ci.yml # CI：push/PR 自动跑 npm test
├── CHANGELOG.md / LICENSE / README.md
```

## 上传到 GitHub

1. 在 GitHub 新建空仓库（不要勾选 README/.gitignore，避免冲突）；
2. 按 GitHub 页面提示执行（或直接照下面做）：

```bash
cd dsh-whale-persona
git remote add origin https://github.com/<你的用户名>/dsh-whale-persona.git
git branch -M main
git push -u origin main
```

3. push 后 GitHub Actions 会自动跑测试；给别人安装时用「从 GitHub 安装」一节的
   clone + `dsh plugin add` 即可（注意告知对方：`dsh plugin add` 用绝对路径，
   新增插件包需要重启 DSH）。

## 已知边界（诚实说明）

- **temperature / top_p / max_tokens**：当前 DSH 部署的模型参数由模型选择与
  agent preset 决定，本插件把它们作为性格元数据**展示 + 进化调节**（写入
  store），不影响现有模型路由；若日后 DSH 开放 per-request 参数 seam 可无缝接入。
- 调度器只在宿主进程运行时生效（每 20 秒检查一次）；关闭页面不影响宿主内的
  定时切换，但页面关闭期间心跳暂停、不累计时长。
- 删除内置性格后可在「性格预设库」页恢复；导出文件不含使用统计。
- 许可证：MIT（内置人设文本为使用者提供的样例模板）。
