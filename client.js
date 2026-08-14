/**
 * 归档对话查看 — Browser half.
 *
 * Hand-written client bundle for the composition plugin. Loaded at page boot
 * via the dsh.client roster (__DSH_BOOT__), so it survives refresh. Talks to
 * the Host through the Typert gateway endpoints (/api/archivedConversations/*)
 * instead of the dynamic-runner host.call.
 */
window.__ModuleLoader__.load({
  id: 'archived-conversation-viewer',
  factory: (require) => {
    try {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      var React = require('react');

      if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="archived-conversation-viewer"]') === null) {
        var style = document.createElement('style');
        style.dataset.plugin = 'archived-conversation-viewer';
        style.dataset.pluginCss = 'archived-conversation-viewer';
        style.textContent = [
          '.archv-panel { border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); padding: 10px 12px; color: var(--dsw-alias-label-primary); font-size: 13px; line-height: 1.5; }',
          '.archv-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 600; }',
          '.archv-count { color: var(--dsw-alias-label-secondary); font-weight: 400; }',
          '.archv-desc { color: var(--dsw-alias-label-secondary); font-size: 12px; margin: 0 0 10px; }',
          '.archv-btn-plain { border: 1px solid var(--dsw-alias-border-l1); background: transparent; color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 2px 10px; cursor: pointer; font-size: 12px; }',
          '.archv-btn-plain:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }',
          '.archv-empty { color: var(--dsw-alias-label-secondary); padding: 8px 0; }',
          '.archv-error { color: var(--dsw-alias-state-error-primary); padding: 8px 0; white-space: pre-wrap; }',
          '.archv-groups { max-height: 55vh; overflow-y: auto; padding-right: 4px; }',
          '.archv-group { border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; margin: 8px 0; overflow: hidden; }',
          '.archv-group-head { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; background: var(--dsw-alias-bg-layer-2); }',
          '.archv-group-head:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,0.12)); }',
          '.archv-group-chevron { color: var(--dsw-alias-label-secondary); font-size: 11px; flex: none; }',
          '.archv-group-title { font-weight: 600; flex: none; }',
          '.archv-group-meta { color: var(--dsw-alias-label-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }',
          '.archv-group-count { color: var(--dsw-alias-label-secondary); font-size: 12px; flex: none; }',
          '.archv-group-body { padding: 4px 8px 8px; }',
          '.archv-row { border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; margin: 6px 0; }',
          '.archv-row-title { padding: 6px 10px; display: flex; align-items: center; gap: 8px; cursor: pointer; }',
          '.archv-row-title:hover { background: var(--dsw-alias-bg-layer-2); }',
          '.archv-row-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }',
          '.archv-row-meta { color: var(--dsw-alias-label-secondary); font-size: 12px; white-space: nowrap; }',
          '.archv-row-actions { display: flex; align-items: center; gap: 6px; flex: none; }',
          '.archv-btn { border: 1px solid var(--dsw-alias-border-l1); background: transparent; color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 2px 10px; cursor: pointer; font-size: 12px; white-space: nowrap; }',
          '.archv-btn:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }',
          '.archv-btn[disabled] { opacity: 0.5; cursor: default; }',
          '.archv-btn-restore { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }',
          '.archv-btn-danger { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }',
          '.archv-btn-danger-confirm { background: var(--dsw-alias-state-error-primary); color: #fff; border-color: var(--dsw-alias-state-error-primary); }',
          '.archv-transcript { border-top: 1px solid var(--dsw-alias-border-l1); max-height: 320px; overflow: auto; padding: 8px 10px; }',
          '.archv-msg { margin: 6px 0; }',
          '.archv-msg-head { display: flex; gap: 8px; align-items: baseline; color: var(--dsw-alias-label-secondary); font-size: 12px; }',
          '.archv-msg-role { font-weight: 700; }',
          '.archv-msg-role.user { color: var(--dsw-alias-brand-primary); }',
          '.archv-msg-role.assistant { color: var(--dsw-alias-state-success-primary); }',
          '.archv-msg-role.tool { color: var(--dsw-alias-state-warn-primary); }',
          '.archv-msg-text { white-space: pre-wrap; word-break: break-word; margin-top: 2px; }',
          '.archv-card { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-3); border-radius: 12px; list-style: none; transition: border-color .16s, background .16s; }',
          '.archv-card:hover { border-color: var(--dsw-alias-label-dimmed); }',
          '.archv-card-open { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-label-dimmed); }',
          '.archv-card-head { appearance: none; width: 100%; font: inherit; color: inherit; text-align: left; cursor: pointer; background: transparent; border: 0; border-radius: 12px; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }',
          '.archv-card-head:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }',
          '.archv-card-headText { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 4px; }',
          '.archv-card-name { color: var(--dsw-alias-label-primary); font-size: 15px; font-weight: 600; line-height: 1.4; }',
          '.archv-card-desc { color: var(--dsw-alias-label-tertiary); font-size: 13px; line-height: 1.5; }',
          '.archv-card-tag { white-space: nowrap; background: rgba(24, 160, 88, 0.14); color: var(--dsw-alias-state-success-primary); border-radius: 999px; padding: 1px 8px; font-size: 11px; font-weight: 500; line-height: 17px; flex: none; }',
          '.archv-card-chevron { color: var(--dsw-alias-label-tertiary); flex: none; font-size: 11px; transition: transform .16s; }',
          '.archv-card-chevron-open { transform: rotate(180deg); }',
          '.archv-card-body { border-top: 1px solid var(--dsw-alias-border-l2); margin: 0 16px; padding: 10px 0 12px; }',
          '.archv-card-row { display: flex; gap: 8px; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; }',
          '.archv-card-key { flex: none; color: var(--dsw-alias-label-tertiary); }',
          '.archv-card-val { min-width: 0; word-break: break-word; }'
        ].join('\n');
        document.head.appendChild(style);
      }

      function fmtTime(ms) {
        if (!ms) return '';
        var d = new Date(ms);
        var p = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
      }

      var ROLE_LABEL = { user: '用户', assistant: '助手', tool: '工具' };
      var GROUP_KEY_UNGROUPED = '__ungrouped__';

      /** Call one Host Remote endpoint through the Connection's generic RPC. */
      function rpc(ctx, method, args) {
        var connection = ctx.get('connection');
        if (!connection || !connection.rpc || !connection.rpc.call) {
          return Promise.resolve({ error: 'connection 服务不可用' });
        }
        return connection.rpc.call('/api', 'archivedConversations/' + method, { args: args || {} }, undefined).then(function (res) {
          if (!res || typeof res !== 'object') return { error: '无效响应' };
          if (res.ok) return res.value;
          return { error: (res.error && res.error.message) || 'RPC 失败' };
        }).catch(function (err) {
          return { error: String(err && err.message ? err.message : err) };
        });
      }

      function renderTranscript(tr) {
        if (!tr) return null;
        if (tr.loading) return React.createElement('div', { className: 'archv-empty' }, '加载中…');
        if (tr.error) return React.createElement('div', { className: 'archv-error' }, tr.error);
        if (!tr.events || tr.events.length === 0) return React.createElement('div', { className: 'archv-empty' }, '该会话没有可显示的对话内容');
        return tr.events.map(function (ev) {
          return React.createElement('div', { key: ev.seq, className: 'archv-msg' },
            React.createElement('div', { className: 'archv-msg-head' },
              React.createElement('span', { className: 'archv-msg-role ' + ev.kind }, ROLE_LABEL[ev.kind] || ev.kind),
              React.createElement('span', null, fmtTime(ev.time)),
              React.createElement('span', null, '#' + ev.seq)
            ),
            React.createElement('div', { className: 'archv-msg-text' }, ev.text || '（空）')
          );
        });
      }

      function ArchivedManager(props) {
        var api = props.api;
        var hooks = React.useState(null);
        var groups = hooks[0];
        var setGroups = hooks[1];
        var hooks2 = React.useState(null);
        var error = hooks2[0];
        var setError = hooks2[1];
        var hooks3 = React.useState({});
        var collapsed = hooks3[0];
        var setCollapsed = hooks3[1];
        var hooks4 = React.useState(null);
        var openId = hooks4[0];
        var setOpenId = hooks4[1];
        var hooks5 = React.useState({});
        var transcripts = hooks5[0];
        var setTranscripts = hooks5[1];
        var hooks6 = React.useState(null);
        var confirmId = hooks6[0];
        var setConfirmId = hooks6[1];
        var hooks7 = React.useState(null);
        var busy = hooks7[0];
        var setBusy = hooks7[1];
        var hooks8 = React.useState(null);
        var actionError = hooks8[0];
        var setActionError = hooks8[1];

        var loadList = function () {
          setError(null);
          setGroups(null);
          rpc(api, 'list', {}).then(function (res) {
            if (res && res.error) {
              setError(res.error);
              setGroups([]);
              return;
            }
            setGroups(res && Array.isArray(res.groups) ? res.groups : []);
          }).catch(function (err) {
            setError(String(err && err.message ? err.message : err));
            setGroups([]);
          });
        };

        React.useEffect(function () { loadList(); }, []);

        var toggleTranscript = function (sessionId) {
          if (openId === sessionId) { setOpenId(null); return; }
          setOpenId(sessionId);
          if (transcripts[sessionId]) return;
          setTranscripts(function (t) { return Object.assign({}, t, { [sessionId]: { loading: true, error: null, events: null } }); });
          rpc(api, 'read', { sessionId: sessionId }).then(function (res) {
            var next = res && res.error
              ? { loading: false, error: res.error, events: null }
              : { loading: false, error: null, events: (res && res.events) || [] };
            setTranscripts(function (t) { return Object.assign({}, t, { [sessionId]: next }); });
          }).catch(function (err) {
            setTranscripts(function (t) { return Object.assign({}, t, { [sessionId]: { loading: false, error: String(err && err.message ? err.message : err), events: null } }); });
          });
        };

        var runAction = function (sessionId, method) {
          if (busy !== null) return;
          setBusy(sessionId);
          setActionError(null);
          rpc(api, method, { sessionId: sessionId }).then(function (res) {
            setBusy(null);
            if (res && res.error) {
              setActionError(res.error);
            } else {
              setConfirmId(null);
              loadList();
            }
          }).catch(function (err) {
            setBusy(null);
            setActionError(String(err && err.message ? err.message : err));
          });
        };

        var restore = function (sessionId) { runAction(sessionId, 'restore'); };
        var del = function (sessionId) {
          if (confirmId !== sessionId) { setConfirmId(sessionId); return; }
          runAction(sessionId, 'deleteSession');
        };

        var toggleGroup = function (key) { setCollapsed(function (c) { return Object.assign({}, c, { [key]: !c[key] }); }); };
        var expandAll = function () { setCollapsed({}); };
        var collapseAll = function () {
          var c = {};
          for (var i = 0; i < (groups || []).length; i++) c[groups[i].workspaceId || GROUP_KEY_UNGROUPED] = true;
          setCollapsed(c);
        };

        var renderSessionRow = function (s) {
          var tr = transcripts[s.sessionId];
          var expanded = openId === s.sessionId;
          var isBusy = busy === s.sessionId;
          var isConfirm = confirmId === s.sessionId;
          return React.createElement('div', { key: s.sessionId, className: 'archv-row' },
            React.createElement('div', { className: 'archv-row-title' },
              React.createElement('span', { className: 'archv-row-name', title: s.sessionId, onClick: function () { toggleTranscript(s.sessionId); } }, s.title || ('（无标题） ' + s.sessionId)),
              React.createElement('span', { className: 'archv-row-meta' }, fmtTime(s.createdAt)),
              React.createElement('span', { className: 'archv-row-actions' },
                React.createElement('button', { className: 'archv-btn archv-btn-restore', disabled: busy !== null, onClick: function () { restore(s.sessionId); } }, isBusy ? '处理中…' : '恢复'),
                React.createElement('button', { className: 'archv-btn archv-btn-danger' + (isConfirm ? ' archv-btn-danger-confirm' : ''), disabled: busy !== null, onClick: function () { del(s.sessionId); } }, isConfirm ? '确认删除？' : '删除'),
                React.createElement('span', { className: 'archv-row-meta', onClick: function () { toggleTranscript(s.sessionId); } }, expanded ? '收起' : '查看')
              )
            ),
            expanded ? React.createElement('div', { className: 'archv-transcript' }, renderTranscript(tr)) : null
          );
        };

        var total = groups ? groups.reduce(function (n, g) { return n + g.sessions.length; }, 0) : 0;
        var anyCollapsed = groups !== null && groups.some(function (g) { return collapsed[g.workspaceId || GROUP_KEY_UNGROUPED]; });
        var groupEls = (groups || []).map(function (g) {
          var key = g.workspaceId || GROUP_KEY_UNGROUPED;
          var isCollapsed = !!collapsed[key];
          return React.createElement('div', { key: key, className: 'archv-group' },
            React.createElement('div', { className: 'archv-group-head', onClick: function () { toggleGroup(key); } },
              React.createElement('span', { className: 'archv-group-chevron' }, isCollapsed ? '▸' : '▾'),
              React.createElement('span', { className: 'archv-group-title' }, g.title || '未分组'),
              React.createElement('span', { className: 'archv-group-meta' }, g.path || ''),
              React.createElement('span', { className: 'archv-group-count' }, g.sessions.length + ' 个')
            ),
            isCollapsed ? null : React.createElement('div', { className: 'archv-group-body' }, g.sessions.map(renderSessionRow))
          );
        });

        return React.createElement('div', { className: 'archv-panel' },
          React.createElement('div', { className: 'archv-head' },
            React.createElement('span', null, '📁 归档会话'),
            React.createElement('span', { className: 'archv-count' }, groups ? ('共 ' + total + ' 个') : ''),
            React.createElement('button', { className: 'archv-btn-plain', onClick: anyCollapsed ? expandAll : collapseAll, disabled: groups === null || groups.length === 0 }, anyCollapsed ? '全部展开' : '全部收起'),
            React.createElement('button', { className: 'archv-btn-plain', onClick: loadList }, '刷新')
          ),
          React.createElement('div', { className: 'archv-desc' }, '按工作区分组，列表区域可上下滚动。恢复：把会话从归档集中移出，重新出现在侧边栏；删除：同时清除归档记录、分组归属和本机会话日志（session.jsonl.zstd），不可恢复。点击会话行可展开查看完整对话。'),
          error ? React.createElement('div', { className: 'archv-error' }, error) : null,
          actionError ? React.createElement('div', { className: 'archv-error' }, actionError) : null,
          groups === null ? React.createElement('div', { className: 'archv-empty' }, '加载中…') : null,
          groups !== null && total === 0 ? React.createElement('div', { className: 'archv-empty' }, '暂无归档会话。归档入口：侧边栏会话行菜单 →「归档」；归档后对话会从列表中消失，可在此查看、恢复或删除。') : null,
          React.createElement('div', { className: 'archv-groups' }, groupEls)
        );
      }

      function PluginCard() {
        var hooks = React.useState(false);
        var open = hooks[0];
        var setOpen = hooks[1];
        return React.createElement('li', { className: 'archv-card' + (open ? ' archv-card-open' : '') },
          React.createElement('button', { type: 'button', className: 'archv-card-head', 'aria-expanded': open, onClick: function () { setOpen(!open); } },
            React.createElement('span', { className: 'archv-card-headText' },
              React.createElement('span', { className: 'archv-card-name' }, '归档对话查看'),
              React.createElement('span', { className: 'archv-card-desc' }, '在设置页查看归档会话，支持按工作区分组、一键恢复与彻底删除。')
            ),
            React.createElement('span', { className: 'archv-card-tag' }, '● 已启用'),
            React.createElement('span', { className: 'archv-card-chevron' + (open ? ' archv-card-chevron-open' : '') }, '▾')
          ),
          open ? React.createElement('div', { className: 'archv-card-body' },
            React.createElement('div', { className: 'archv-card-row' },
              React.createElement('span', { className: 'archv-card-key' }, '功能'),
              React.createElement('span', { className: 'archv-card-val' }, '查看归档会话全文、按工作区分组与折叠、恢复（取消归档）、删除（清除归档/分组/日志，两次确认）。')
            ),
            React.createElement('div', { className: 'archv-card-row' },
              React.createElement('span', { className: 'archv-card-key' }, '管理入口'),
              React.createElement('span', { className: 'archv-card-val' }, '设置 →「归档会话」')
            ),
            React.createElement('div', { className: 'archv-card-row' },
              React.createElement('span', { className: 'archv-card-key' }, '类型'),
              React.createElement('span', { className: 'archv-card-val' }, '组合插件（archived-conversation-viewer），刷新/重启均保留')
            )
          ) : null
        );
      }

      exports.apply = function (ctx) {
        var slots = ctx.get('slots');
        if (!slots) return;
        try {
          slots.inject('settings.section', function () {
            return slots.register(
              { name: 'settings.section', id: 'archived-sessions', order: 30, label: '归档会话' },
              function (props) { return React.createElement(ArchivedManager, { api: ctx }); }
            );
          });
          slots.inject('settings.plugin.item', function () {
            return slots.register(
              { name: 'settings.plugin.item', id: 'archived-conversations', order: 30, label: '归档对话查看' },
              function (props) { return React.createElement(PluginCard, null); }
            );
          });
        } catch (err) {
          console.error('[archived-conversation-viewer] client apply failed:', err);
        }
      };

      return module.exports;
    } catch (err) {
      console.error('[archived-conversation-viewer] bundle failed:', err);
      return { apply: function () {} };
    }
  }
});
