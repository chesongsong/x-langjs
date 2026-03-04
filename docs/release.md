# 发布到 GitHub Release 与 npm

## 本地一键发布（推荐）

在仓库根目录执行脚本即可完成：构建 → 发布到 npm →（可选）打 tag 并推送以触发 GitHub Release。

```bash
# 方式一：使用脚本（可带版本号）
./scripts/publish.sh              # 用当前版本，只构建并发布 npm
./scripts/publish.sh 0.0.2        # 改为 0.0.2，构建 + 发布 npm + 打 tag 并推送
./scripts/publish.sh 0.0.2 --no-tag   # 只改版本、构建、发布 npm，不打 tag
./scripts/publish.sh --dry-run    # 仅构建，不真正发布、不 git 操作

# 方式二：通过 npm 命令
pnpm run publish:local           # 等同于 ./scripts/publish.sh
pnpm run publish:local -- 0.0.2  # 带参数需用 -- 分隔
```

**发布前**：若未配置 `NPM_TOKEN` 环境变量，需先在本机执行 `npm login` 登录 npm。

---

## 流程说明（CI 自动发布）

1. 推送版本 tag（如 `v0.1.0`）到仓库后，GitHub Actions 会触发 **Release** 工作流。
2. 工作流会执行：安装依赖 → 构建 types → 构建 core 与各包 → 构建 playground。
3. 将 **playground 静态产物** 打成 `playground-<version>.zip`，并上传到该 tag 对应的 **GitHub Release**。
4. 将 **@x-lang/* 各包**（types、parser、ast、interpreter、render、core）按 tag 版本号发布到 **npm**。
5. Release 的正文会从 `CHANGELOG.md` 中截取当前版本的段落作为发行说明。

## 发布前：配置 npm Token

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中新增 Secret：

- **Name**：`NPM_TOKEN`
- **Value**：npm 的 Access Token（推荐使用 **Automation** 或 **Publish** 权限的 Classic Token）。

生成 Token：登录 [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens → Generate New Token。

## 发布第一版（v0.1.0）

在仓库根目录执行：

```bash
# 确保当前代码已提交
git status

# 打 tag（与 package.json / CHANGELOG 中的 0.1.0 对应）
git tag v0.1.0

# 推送 tag 到远程，触发 Release 工作流
git push origin v0.1.0
```

等待 Actions 跑完后：

- **GitHub Releases** 页面会看到新版本、附件 `playground-v0.1.0.zip` 以及从 `CHANGELOG.md` 截取的发行说明。
- **npm** 上会发布 `@x-lang/types`、`@x-lang/parser`、`@x-lang/ast`、`@x-lang/interpreter`、`@x-lang/render`、`@x-lang/core`（需已配置 `NPM_TOKEN`）。

## 后续版本

1. 在 `CHANGELOG.md` 中按 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 格式新增一节，例如：

   ```markdown
   ## [0.2.0] - 2026-xx-xx
   ### Added
   - ...
   ```

2. 提交并推送，然后打新 tag 并推送：

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

新版本的 Release 正文会自动使用 `CHANGELOG.md` 中对应版本段落。
