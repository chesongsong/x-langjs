#!/usr/bin/env bash
# 本地一键发布脚本：构建 → 更新版本（可选）→ 发布到 npm → 打 tag 并推送（可选，用于触发 GitHub Release）
# 使用方式：
#   ./scripts/publish.sh              # 使用当前 package.json 版本，仅构建并发布到 npm
#   ./scripts/publish.sh 0.0.2        # 将版本改为 0.0.2，构建、发布 npm、打 tag 并推送
#   ./scripts/publish.sh 0.0.2 --no-tag   # 只改版本、构建、发布 npm，不打 tag 不推送
#   ./scripts/publish.sh --dry-run    # 仅构建 + 模拟发布，不真正 publish / 不 git 操作

set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)

# 解析参数
NEW_VERSION=""
DRY_RUN=false
NO_TAG=false
for arg in "$@"; do
  case "$arg" in
    --dry-run)   DRY_RUN=true ;;
    --no-tag)    NO_TAG=true ;;
    -h|--help)
      echo "用法: $0 [版本号] [--dry-run] [--no-tag]"
      echo "  版本号    如 0.0.2，会写入所有 packages/*/package.json 并 commit+tag+push"
      echo "  --dry-run 只构建、不真正 publish、不 git 操作"
      echo "  --no-tag  即使给了版本号，也不打 tag、不 push（只发布 npm）"
      exit 0
      ;;
    *)
      if [[ "$arg" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        NEW_VERSION="$arg"
      fi
      ;;
  esac
done

echo "=========================================="
echo "  x-lang 本地发布脚本"
echo "=========================================="

# 1. 若指定了新版本，更新所有 packages/*/package.json
if [ -n "$NEW_VERSION" ]; then
  echo ">>> 将版本更新为 $NEW_VERSION"
  for f in packages/*/package.json; do
    node -e "
      const fs = require('fs');
      const p = JSON.parse(fs.readFileSync('$f', 'utf8'));
      p.version = '$NEW_VERSION';
      fs.writeFileSync('$f', JSON.stringify(p, null, 2) + '\n');
    "
    echo "    已更新 $f"
  done
  CURRENT_VERSION="$NEW_VERSION"
else
  CURRENT_VERSION=$(node -e "console.log(require('./packages/core/package.json').version)")
  echo ">>> 使用当前版本: $CURRENT_VERSION"
fi

# 2. 安装依赖并构建
echo ""
echo ">>> 安装依赖..."
pnpm install --frozen-lockfile

echo ">>> 构建 types..."
pnpm --filter @x-lang/types run build

echo ">>> 构建全部包（generate + tsc + bundle）..."
pnpm run build

echo ">>> 构建完成"
ls -la packages/core/dist/x-lang.min.js 2>/dev/null || { echo "错误: x-lang.min.js 未生成"; exit 1; }

# 3. 发布到 npm
if [ "$DRY_RUN" = true ]; then
  echo ""
  echo ">>> [dry-run] 跳过 npm publish"
else
  echo ""
  if [ -z "$NPM_TOKEN" ]; then
    echo ">>> 发布到 npm（使用当前 npm 登录状态）..."
    echo "    若未登录请先执行: npm login"
    pnpm publish -r --no-git-checks --access public
  else
    echo ">>> 发布到 npm（使用环境变量 NPM_TOKEN）..."
    export NODE_AUTH_TOKEN="$NPM_TOKEN"
    pnpm publish -r --no-git-checks --access public
  fi
  echo ">>> npm 发布完成"
fi

# 4. 若指定了新版本且未 --no-tag，则 commit + tag + push
if [ -n "$NEW_VERSION" ] && [ "$NO_TAG" = false ] && [ "$DRY_RUN" = false ]; then
  echo ""
  echo ">>> 提交版本变更并打 tag v$NEW_VERSION ..."
  git add packages/*/package.json
  git status --short
  if git diff --staged --quiet 2>/dev/null; then
    echo "    无 package.json 变更，跳过 commit"
  else
    git commit -m "chore: release v$NEW_VERSION"
  fi
  git tag -f "v$NEW_VERSION"
  echo ">>> 推送 main 与 tag v$NEW_VERSION 到远程（将触发 GitHub Release）..."
  git push origin main
  git push origin "v$NEW_VERSION"
  echo ""
  echo ">>> 全部完成。GitHub Actions 将自动创建 Release 并发布到 GitHub Packages。"
fi

echo ""
echo "=========================================="
echo "  发布完成: 版本 $CURRENT_VERSION"
echo "=========================================="
