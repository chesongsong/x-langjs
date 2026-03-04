# x-langjs

ANTLR4 + TypeScript DSL runtime that executes `x-langjs` code blocks in Markdown and renders outputs through a pluggable UI layer.

## Project Structure

```text
packages/
  types/        @x-langjs/types        AST types and error classes
  parser/       @x-langjs/parser       ANTLR lexer/parser
  ast/          @x-langjs/ast          CST -> AST + scope resolver
  interpreter/  @x-langjs/interpreter  Runtime evaluator and value domain
  render/       @x-langjs/render       Render interfaces + RenderEngine
  core/         @x-langjs/core         Public SDK entry
playground/     @x-langjs/playground   Vite demo app
```

## Install (Recommended)

```bash
npm install @x-langjs/core
# or
pnpm add @x-langjs/core
```

## Quick Usage

```ts
import { parse, run } from "@x-langjs/core";

const parsed = parse("a = 1\nb = a + 2\nb");

const executed = run(`
# report
\`\`\`x-langjs
total = 100
total
\`\`\`
`);

console.log(parsed.errors, executed.segments);
```

## Browser / Bundle File Usage

Download build artifacts from GitHub Releases:

- `x-langjs-<version>.min.js` (browser IIFE, global `XLang`)
- `x-langjs-<version>.esm.mjs` (ESM)
- `x-langjs-<version>.cjs` (CommonJS)

```html
<script src="x-langjs-0.0.4.min.js"></script>
<script>
  const { parse, run } = XLang;
  console.log(parse("a=1").errors);
</script>
```

## Monorepo Development

```bash
npm install
npm run build
npm run dev
```

## Package Docs

- `packages/core/README.md`
- `packages/types/README.md`
- `packages/parser/README.md`
- `packages/ast/README.md`
- `packages/interpreter/README.md`
- `packages/render/README.md`

## License

MIT (see `LICENSE`).
