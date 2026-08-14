/**
 * 归档对话查看 — Host half.
 *
 * A permanent composition plugin: provides the `archivedConversations` Typert
 * Remote service so the browser half can list / read / restore / delete
 * archived sessions.
 *
 * Registered in the profile composition (cordis.patch.yml), so it appears in
 * 设置 → 插件 → 全部 and survives refresh and restart.
 *
 * The endpoints are exposed through a strict Typert manifest registered at
 * runtime (ctx.typert.register) instead of @Remote SRC markers, so the host
 * gateway claims and dispatches them without marker reflection.
 */
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { TYPERT } from './typert.host.js';

function blockText(blocks) {
  if (!Array.isArray(blocks)) return '';
  const parts = [];
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    if (b.type === 'text') parts.push(b.text);
    else if (b.type === 'reasoning') parts.push('（思考）' + b.text);
    else if (b.type === 'image') parts.push('[图片]');
    else if (b.type === 'tool-call') parts.push('[工具调用 ' + b.name + ']\n' + b.arguments);
    else if (b.type === 'tool-result') parts.push('[工具结果' + (b.isError ? '·出错' : '') + ']\n' + blockText(b.content));
  }
  return parts.filter((s) => s && s.length).join('\n');
}

class ArchivedConversationsService extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'archivedConversations');
    this.deps = {
      ws: ctx.get('workspaceRegistry'),
      sq: ctx.get('sessionQuery'),
      sp: ctx.get('sessionPersistence'),
      sub: ctx.get('subprocess'),
      sessions: ctx.get('sessions'),
    };
  }

  /** 按工作区分组列出归档会话（含标题与创建时间）。 */
  async list() {
    const { ws, sq } = this.deps;
    const archivedIds = Array.from(ws.archivedSessionIds);
    if (archivedIds.length === 0) return { groups: [] };
    const titles = new Map();
    const observations = await sq.readTitleSnapshots(archivedIds);
    for (const obs of observations) {
      if (obs.status === 'fulfilled') titles.set(obs.sessionId, obs.value.title ? obs.value.title.title : null);
    }
    const headers = new Map();
    const records = await sq.listSessions();
    for (const r of records) headers.set(r.header.id, r.header);
    const workspaceOf = new Map();
    for (const w of ws.list()) {
      for (const sid of w.sessionIds) workspaceOf.set(sid, { workspaceId: w.id, title: w.title, path: w.path });
    }
    const meta = (id) => {
      const h = headers.get(id);
      return { sessionId: id, title: titles.get(id) || null, createdAt: h ? h.createdAt : null, orphan: h === undefined };
    };
    const groups = [];
    const seen = new Set();
    for (const w of ws.list()) {
      const sessions = archivedIds.filter((id) => {
        const m = workspaceOf.get(id);
        return m !== undefined && m.workspaceId === w.id;
      });
      if (sessions.length === 0) continue;
      for (const id of sessions) seen.add(id);
      sessions.sort((a, b) => (headers.get(b)?.createdAt || 0) - (headers.get(a)?.createdAt || 0));
      groups.push({ workspaceId: w.id, title: w.title, path: w.path, sessions: sessions.map(meta) });
    }
    const ungrouped = archivedIds.filter((id) => !seen.has(id));
    if (ungrouped.length > 0) {
      ungrouped.sort((a, b) => (headers.get(b)?.createdAt || 0) - (headers.get(a)?.createdAt || 0));
      groups.push({ workspaceId: null, title: '未分组', path: null, sessions: ungrouped.map(meta) });
    }
    return { groups };
  }

  /** 读取一个归档会话的对话全文。 */
  async read(sessionId) {
    const { ws, sq } = this.deps;
    if (!Array.from(ws.archivedSessionIds).includes(sessionId)) return { error: '该会话不在归档集合中' };
    try {
      const snap = await sq.readSession(sessionId);
      const events = [];
      for (const ev of snap.events) {
        if (ev.type === 'user/message') {
          events.push({ seq: ev.seq, time: ev.time, kind: 'user', text: blockText(ev.data.content) });
        } else if (ev.type === 'assistant/message') {
          events.push({ seq: ev.seq, time: ev.time, kind: 'assistant', text: blockText(ev.data.message.content) });
        } else if (ev.type === 'tool/result') {
          events.push({ seq: ev.seq, time: ev.time, kind: 'tool', text: blockText(ev.data.message.content) });
        }
      }
      return { sessionId, events };
    } catch (err) {
      return { error: err && err.message ? String(err.message) : String(err) };
    }
  }

  /** 恢复：把会话从归档集合中移出，并按会话 cwd 重新挂回原工作区。 */
  async restore(sessionId) {
    const { ws, sq, sp } = this.deps;
    if (!Array.from(ws.archivedSessionIds).includes(sessionId)) return { error: '该会话不在归档集合中' };
    try {
      const headers = await sp.list();
      if (!headers.some((h) => h.id === sessionId)) {
        return { error: '该会话的日志已不存在（可能是残留的归档记录），无法恢复；请改用「删除」清理它。' };
      }
      await this.unarchiveOnly(sessionId, ws);
      // 找回工作区归属：会话不在任何工作区账户里，且其 header.cwd 匹配某个工作区路径时重新挂载。
      await ws.enqueueOperation(async () => {
        const inAny = ws.list().some((w) => w.sessionIds.includes(sessionId));
        if (inAny) return;
        let cwd = null;
        try {
          const records = await sq.listSessions();
          const h = records.find((r) => r.header.id === sessionId)?.header;
          cwd = h && typeof h.cwd === 'string' && h.cwd.length > 0 ? h.cwd : null;
        } catch (e) { /* header 读取失败则保持未分组 */ }
        if (cwd === null) return;
        const norm = (p) => String(p).replace(/[\\/]+/g, '\\').toLowerCase();
        const target = ws.list().find((w) => norm(w.path) === norm(cwd));
        if (target === undefined) return;
        try { await target.attachSession(sessionId); } catch (e) { /* cwd 校验不匹配则保持未分组 */ }
      });
      return { ok: true };
    } catch (err) {
      return { error: err && err.message ? String(err.message) : String(err) };
    }
  }

  /** 仅把 sessionId 从归档标志中移出。 */
  async unarchiveOnly(sessionId, ws) {
    await ws.enqueueOperation(async () => {
      const state = ws.requireState();
      if (!state.archivedSessionIds.includes(sessionId)) return;
      await ws.setState({ ...state, archivedSessionIds: state.archivedSessionIds.filter((id) => id !== sessionId) });
    });
  }

  /** 把 sessionId 从所有工作区账户中移除（卫生操作，幂等）。 */
  async detachFromWorkspaces(sessionId, ws) {
    await ws.enqueueOperation(async () => {
      const table = ws.requireTable();
      for (const w of ws.list()) {
        if (w.sessionIds.includes(sessionId)) {
          await table.update(w.id, (record) => ({
            ...record,
            sessionIds: record.sessionIds.filter((id) => id !== sessionId),
            updatedAt: new Date().toISOString(),
          }));
        }
      }
      ws.rebuildEntities();
    });
  }

  /** 删除：先删会话日志目录（物化记录随之消失），成功后再清归档标志与分组归属。 */
  async deleteSession(sessionId) {
    const { ws, sp, sub, sessions } = this.deps;
    try {
      if (sessions !== undefined && sessions.get(sessionId) !== undefined) {
        return { error: '该会话正在运行中，日志文件被占用，无法彻底删除。请先停止该会话，或先用「恢复」把它移出归档。' };
      }
      if (!Array.from(ws.archivedSessionIds).includes(sessionId)) return { error: '该会话不在归档集合中' };

      const headers = await sp.list();
      const header = headers.find((h) => h.id === sessionId);
      if (header === undefined) {
        // 幽灵条目：日志已不存在，无需（也无法）删日志——直接清理归档标志与分组归属。
        await this.unarchiveOnly(sessionId, ws);
        await this.detachFromWorkspaces(sessionId, ws);
        return { ok: true, note: '会话日志已不存在，已清理归档记录' };
      }
      const loc = sp.locate(header);
      if (!loc || typeof loc.path !== 'string' || loc.path.length === 0) return { error: '无法定位会话日志文件' };
      const logPath = loc.path;
      const dir = logPath.replace(/[\\/][^\\/]*$/, '');
      if (dir.length === 0 || dir === logPath) return { error: '会话日志目录无效' };

      // 1) 先删日志目录：失败则整个删除中止，会话保持原样（仍归档、仍分组）。
      if (sub === undefined) return { error: 'subprocess 服务不可用，无法删除日志文件' };
      let exe = null;
      try { exe = await sub.resolveExecutable('pwsh'); } catch (e) { /* fallthrough */ }
      if (exe === null) {
        try { exe = await sub.resolveExecutable('powershell'); } catch (e2) { /* fallthrough */ }
      }
      if (exe === null) return { error: '找不到 PowerShell，无法删除日志文件' };
      const parent = dir.replace(/[\\/][^\\/]*$/, '');
      const quoted = "'" + dir.replace(/'/g, "''") + "'";
      // 收集模式（非 inherit）：DSH 宿主无控制台时 inherit 会让 Windows 给子进程新开命令行窗口。
      const handle = sub.spawn({
        argv: [exe, '-NoProfile', '-NonInteractive', '-Command', 'Remove-Item -LiteralPath ' + quoted + ' -Recurse -Force'],
        cwd: parent,
        stdio: { stdin: 'ignore', stdout: { maxBytes: 4096 }, stderr: { maxBytes: 65536 } },
        graceMs: 10000,
      });
      const outcome = await handle.done;
      if (outcome.exitCode !== 0) {
        let detail = '';
        try { detail = handle.collected.stderr.readFrom(0).text.trim(); } catch (e) { /* no stderr */ }
        return { error: '删除日志目录失败（退出码 ' + String(outcome.exitCode) + (detail ? '）：' + detail : '）') };
      }

      // 2) 日志已删，会话不再物化：清理归档标志与工作区账户（卫生操作）。
      await this.unarchiveOnly(sessionId, ws);
      await this.detachFromWorkspaces(sessionId, ws);
      return { ok: true };
    } catch (err) {
      return { error: err && err.message ? String(err.message) : String(err) };
    }
  }
}

export const inject = ['workspaceRegistry', 'sessionQuery', 'sessionPersistence', 'typert'];

export function apply(ctx) {
  new ArchivedConversationsService(ctx);
  // Register the strict Typert invocations so the gateway claims
  // /api/archivedConversations/*. The effect disposer withdraws them when
  // this fiber stops.
  const typert = ctx.get('typert');
  if (typert !== undefined && typeof typert.register === 'function') {
    const dispose = typert.register(TYPERT);
    return () => {
      try { dispose(); } catch (error) { /* already withdrawn */ }
    };
  }
}
