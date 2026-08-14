# 归档对话查看 (archived-conversation-viewer)

一个 DSH Web（Cordis）组合插件：在设置页查看归档会话，支持按工作区分组、一键恢复与彻底删除。刷新页面和重启 DSH 后依然保留。

![界面截图](screenshot.png)

## 功能

- **查看归档会话**：侧边栏会话行菜单 →「归档」后，会话从列表消失，进入归档集合
- **按工作区分组**：列表按工作区（含「未分组」）分组，可单独展开/收缩，也可一键全部展开/收起
- **上下滚动**：列表区域可滚动，方便浏览大量归档会话
- **查看对话全文**：点击会话行可展开查看完整对话记录（用户/助手/工具消息）
- **恢复**：把会话从归档集合移出，重新出现在侧边栏
- **删除**：彻底清除——移除归档记录、分组归属和本机会话日志目录（`session.jsonl.zstd`），需两次确认，不可恢复

## 使用入口

设置（左下角齿轮）→ **归档会话**

## 安装

1. 将插件目录链接到 DSH profile 的 node_modules：

   ```powershell
   cmd /c mklink /J "C:\Users\AA\.dsh\profiles\node_modules\archived-conversation-viewer" "你的插件源码目录"
   ```

   或直接把本仓库克隆/复制到 `C:\Users\AA\.dsh\profiles\node_modules\archived-conversation-viewer`。

2. 在 `C:\Users\AA\.dsh\profiles\web\cordis.patch.yml` 中加入（若已有 `- insert:` 块则合并到其中）：

   ```yaml
   - insert:
       - id: archived-conversation-viewer
         name: 'archived-conversation-viewer'
   ```

3. 重启 DSH Web（`--profile web`），然后在 设置 → 插件 → 全部 中确认出现 `archived-conversation-viewer`。

## 结构

```text
archived-conversation-viewer/
  package.json        # 包声明（dsh.client 声明浏览器半身）
  index.js            # 宿主半身：archivedConversations Remote 服务（list/read/restore/deleteSession）
  client.js           # 浏览器半身：设置页 UI + 插件卡片（手写 bundle）
  typert.host.js      # 严格 Typert 清单：端点注册（运行时 ctx.typert.register）
  screenshot.png      # 界面截图
```

## 工作原理

- 宿主半身实现 `archivedConversations` Remote 服务，通过 `workspaceRegistry`（归档集合/工作区）、`sessionQuery`（对话读取）、`sessionPersistence`（日志定位）与 `subprocess`（删除日志目录）工作
- 端点通过**严格 Typert 清单**在启动时用 `ctx.typert.register` 注册，宿主网关据此认领 `/api/archivedConversations/*` 并分发
- 浏览器半身通过 `connection.rpc.call('/api', 'archivedConversations/<method>', ...)` 调用宿主，UI 注册在 `settings.section`（归档会话）与 `settings.plugin.item`（插件卡片）

## 许可

MIT
