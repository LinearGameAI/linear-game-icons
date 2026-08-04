---
name: icon-publish
description: 自动执行图标库的完整发布流程：同步 SVG、升级版本、构建验证、发布 npm、提交推送、发送 Lark 通知
---

# icon-publish

自动执行图标库（`@yoroll/react-icon` + `@yoroll/rn-icon`）的完整发版流程。

## 触发词

- "更新图标库"
- "发布图标"
- "publish icons"
- "release icons"

## 重要说明（先读）

- **本文件是唯一的流程来源**，下面 12 个步骤必须全部执行，不要只做前几步。
- **两个包都要发**：`packages/react` → `@yoroll/react-icon`，`packages/rn` → `@yoroll/rn-icon`。
- **不要用 `pnpm run release`（`sh/release.ts`）**：它只升级 react 包，第 4 步会启动预览服务器阻塞等待 Ctrl+C，而且不会发 Lark 通知。按下面的步骤手动执行。
- **npm 认证由用户维护**，不要中途停下来问用户登录/token 的事。若因 OTP 失败，在包目录下用 `npm publish --otp=<任意值>` 作为非交互兜底，然后继续。
- 每个步骤必须成功才能继续下一步。

## 工作流程

### 第一阶段：准备工作

1. **同步 SVG 图标**
   - 运行: `pnpm run sync-icon`
   - 注意：该脚本会先清空 `packages/svg/` 再重新下载，执行前工作区出现大量 `D` 删除记录属于正常现象
   - 同步后用 `git status --short packages/svg` 统计新增/修改的图标，记录下来用于总结

### 第二阶段：React 图标库发布

2. **升级 React 版本号**
   - 读取 `packages/react/package.json` 获取当前版本
   - 自动升级 patch 版本号（例如 0.0.26 -> 0.0.27）
   - 命令: `npm --prefix packages/react version <新版本> --no-git-tag-version`

3. **构建 React 图标库**
   - 运行: `pnpm run build:react`

4. **验证 React 构建结果**
   - 检查 `packages/react/dist/` 目录是否存在
   - 检查关键文件是否生成：`dist/index.js`（或 `dist/index.mjs`）、`dist/index.d.ts`
   - 验证构建产物文件大小是否合理（不为空）
   - 启动预览服务器验证页面可正常打开：
     - 后台运行: `pnpm run preview:react`
     - 等待 3-5 秒让服务器启动
     - 用 curl 检查预览页面是否返回 200
     - 验证完成后停止预览服务器（`pkill -f "next dev"`）
   - 如果任何验证失败，立即终止流程

5. **发布 React 包到 npm**
   - 运行: `pnpm run publish:react`
   - 用 `npm view @yoroll/react-icon@<版本> version` 确认发布真的落地了（npm 的 404 报错有误导性）

### 第三阶段：React Native 图标库发布

6. **升级 React Native 版本号**
   - 读取 `packages/rn/package.json` 获取当前版本
   - 自动升级 patch 版本号（例如 0.0.7 -> 0.0.8）
   - 命令: `npm --prefix packages/rn version <新版本> --no-git-tag-version`

7. **构建 React Native 图标库**
   - 运行: `pnpm run build:rn`

8. **验证 React Native 构建结果**
   - 检查 `packages/rn/dist/` 目录是否存在
   - 检查关键文件是否生成：`dist/index.js`（或 `dist/index.mjs`）、`dist/index.d.ts`
   - 验证构建产物文件大小是否合理（不为空）
   - 启动预览服务器验证页面可正常打开：
     - 后台运行: `pnpm run preview:rn`
     - 等待 3-5 秒让服务器启动
     - 用 curl 检查预览页面（`http://localhost:8081`）是否返回 200
     - 验证完成后停止预览服务器（`pkill -f "expo start"` / `pkill -f "Metro"`）
   - 如果任何验证失败，立即终止流程

9. **发布 React Native 包到 npm**
   - 运行: `pnpm run publish:rn`
   - 用 `npm view @yoroll/rn-icon@<版本> version` 确认发布落地

### 第四阶段：提交变更并推送

10. **提交 git 变更**
    - 运行: `git add .`
    - 提交信息格式: `feat: sync icons and bump react-icon to {react_version}, rn-icon to {rn_version}`

11. **推送到远端**
    - 运行: `git push origin main`

### 第五阶段：发送 Lark 通知

12. **发送发版通知到 Lark 群**
    - 检查环境变量 `LARK_WEBHOOK_URL`（根目录 `.env`，通过 `dotenv` 加载）
    - 如果未配置，跳过此步骤并提示用户
    - 如果已配置，发送下面的 interactive card，包含：
      - 📦 `@yoroll/react-icon@{react_version}`
      - 📦 `@yoroll/rn-icon@{rn_version}`
      - 🕐 发版时间（格式：`YYYY-MM-DD HH:mm:ss`）
      - 🔗 "查看预览" 按钮 → `https://lineargameai.github.io/linear-game-icons/`
    - 返回 `{"StatusCode":0,...,"msg":"success"}` 才算发送成功
    - 如果发送失败，记录错误但不影响整体流程（发版已成功）

## 错误处理

如果任何步骤失败：
- **立即终止整个流程**
- 向用户报告具体错误信息，明确指出哪个步骤失败
- 不要询问是否重试，直接结束

## 成功标准

- 图标同步成功
- 两个包版本号均已升级
- 两个包构建完成无错误、预览校验通过
- 两个包均已发布到 npm 且用 `npm view` 验证
- Git 变更已提交并推送到远端
- Lark 通知已发送（如果配置了 webhook）

## Lark 消息格式

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "🎉 图标库发版成功"
      },
      "template": "green"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**📦 React 包**\n@yoroll/react-icon@{react_version}\n\n**📦 React Native 包**\n@yoroll/rn-icon@{rn_version}\n\n**🕐 发版时间**\n{publish_time}"
        }
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "查看预览"
            },
            "type": "primary",
            "url": "https://lineargameai.github.io/linear-game-icons/"
          }
        ]
      }
    ]
  }
}
```

## 环境变量配置

在项目根目录的 `.env` 文件或系统环境变量中配置：

```bash
LARK_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook-token
```
