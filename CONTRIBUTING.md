# 贡献指南

欢迎给 dsh-whale-persona 提 issue、PR 或自己 fork 一份二次开发。这个文件写给
维护者和贡献者；普通使用者只需要看 README。

## 快速开始（开发）

无需安装任何依赖（纯手写 JS，无构建步骤）：

```bash
git clone https://github.com/wzxk741741/DSH.git dsh-whale-persona
cd dsh-whale-persona
npm test        # 或分别运行 node test/smoke.mjs 与 node test/client-smoke.mjs
```

## 测试约定

- `test/smoke.mjs`：宿主半边纯逻辑测试（提示词组装 / 混合 / 冲突 / 调度 /
  NaN 防御 / 进化进度 / 报告 / 导入映射），无需 DSH 运行时；
- `test/client-smoke.mjs`：浏览器半边在伪 DOM/React 环境下真实执行 loader
  工厂、apply、侧栏条目、浮层与清理。**带 hooks 的组件必须经 `h(Component,
  props)` 挂载、不得当普通函数调用**（否则 hooks 并入父组件序列，会触发
  React "Rendered fewer hooks than expected" 整树卸载），测试内有静态回归防线。

## 提交规范

- 每次改动先跑 `npm test`，全绿再提交；
- commit message 用 Conventional Commits 风格：`feat:` / `fix:` / `docs:` /
  `test:` / `chore:`；
- push 后 GitHub Actions 会自动跑同一套测试。

## 本地验证新代码

1. `dsh plugin --profile web add <本仓库绝对路径>`（link 安装，绝对路径）；
2. `dsh plugin --profile web list` 与 `dsh --profile web --dump-config` 确认
   `whale-persona` entry 已组合；
3. 冷启动探针：`dsh --profile web --no-open --port 0`（独立临时进程，验证后
   只终止该探针），确认 `GET /api/dsh/persona` 正常；
4. 重启正式 DSH 进程让宿主半边生效（纯 `lib/client.js` 改动只需刷新页面）。

## 发布 / 更新流程（维护者）

```bash
cd dsh-whale-persona
npm test
git add -A
git commit -m "fix: …"
git push origin main
```

- 版本号：改 `package.json` 的 `version`，并在 `CHANGELOG.md` 记录变更；
- 给使用者的安装/更新说明以 README「安装 / 更新」一节为准（`dsh plugin add`
  用绝对路径，新增插件包需要重启 DSH）。
