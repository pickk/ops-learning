# 资产管理 API

最新阶段（2026-11-09）：管理员已可在网页读取审计，GET /api/audit 对 viewer/operator 返回 403。真实 Nginx/TLS 临时实验已通过，详见[阶段验证记录](../../代理TLS与综合项目验证-2026-11-09.md)。下文 2026-11-08 的“未验证 TLS”是此前阶段状态；系统服务安装、真实域名和证书续期仍未验证。

Linux 安装有 Nginx、OpenSSL 时，可在本目录运行 `python3 check_tls.py --nginx /path/to/nginx`。脚本使用临时 CA、证书、数据库和回环端口，读取实际代理模板验证登录、写入、任务、Cookie、证书拒绝与限速；不修改系统信任库或安装服务。综合学习见[第十单元](../../第十单元-综合实战与独立开发.md)。

日期：2026-11-08

背景：第五单元的结果放在内存；这里用 SQLite 保存资产，逐步加入真实网页和巡检队列。课程见 [第六单元](../../第六单元-数据库与资产管理后端.md)、[第七单元](../../第七单元-前端与Node交互.md) 与 [第八单元](../../第八单元-运维任务队列与执行.md)。

## 启动

在本目录使用带 sqlite3 的 Python 3：

```text
python check_project.py
python server.py --db assets.sqlite3 --port 8095
```

输出 8095 表示已经监听本机端口。另开终端执行以下完整 Python 示例（保存为 client_practice.py）：

```python
import http.client
import json

connection = http.client.HTTPConnection("127.0.0.1", 8095, timeout=5)
try:
    asset = {"name": "web01", "host": "127.0.0.1", "port": 80, "environment": "test"}
    body = json.dumps(asset).encode("utf-8")
    connection.request("POST", "/api/assets", body, {"Content-Type": "application/json"})
    response = connection.getresponse()
    print(response.status)
    print(response.read().decode("utf-8"))
finally:
    connection.close()
```

第一次创建应是 201；再次创建同名应是 409。浏览器访问 `http://127.0.0.1:8095/api/assets` 查看列表。Ctrl+C 停止，再以同一路径启动，数据应保留。

## 阅读入口与接口

- storage.py：字段验证、建表、参数绑定、事务和审计。
- server.py：HTTP 解析、路由、错误码。
- check_project.py：临时数据库和真实 HTTP 验证，不使用你的 assets.sqlite3。
- web/index.html、style.css、app.js：页面结构、样式与回调交互。
- node_client.cjs：独立 Node 查询客户端，不参与网页运行。
- check_browser.cjs：可选浏览器验证，不属于入门第一遍必读代码。

GET /api/assets 支持 limit（1—100）和 offset（0—1000000）。POST /api/assets 接收 name、host、port、environment 四字段。GET、PUT、DELETE /api/assets/编号 分别查询、完整更新和删除。PUT 与 POST 使用同一字段结构。错误格式为 `{"error":"原因"}`。课程包含完整响应码表。

登记 host 只保存文本，不自动执行网络访问；第八单元新增显式提交的 TCP 检查。审计与资产变更一起提交；删除资产保留审计。所有 SQL 值使用参数绑定。

## 验证结果与限制

2026-11-08，WSL Python 隔离验证通过：新增、同名冲突、更新、删除、不存在、分页、非法字段、非法 JSON、内容类型、超长消息、SQL 特殊文本、审计失败回滚、写锁返回 503、重建服务读取旧数据、审计保留。

第六单元重建服务测试在同一进程进行；第九单元另增实际进程生命周期检查，仍未声称测试断电。数据库忙不自动重试；后写覆盖先写，没有版本冲突保护。基础入口 server.py 不带登录；身份、部署和恢复入口见下方第九单元。尚无完整迁移管理。来源见课程末尾。

## 网页与 Node 客户端

启动 Python 后访问 `http://127.0.0.1:8095/`。页面可新增、编辑、确认删除和分页；断网后保留错误提示，恢复服务后点击刷新。不要双击打开 web/index.html，接口需要同源服务器。

另开终端执行 `node node_client.cjs 8095`，输出总资产数与前五条。Node 只读接口；关闭 Node 不影响网页。运行页面与 Node 客户端都无需第三方包。

可选自动浏览器验证需要本机 Node、Python 和 Playwright。在独立测试环境安装依赖：

```text
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node check_browser.cjs
```

如果 Python 不在 PATH，可在 PowerShell 设置 `$env:COURSE_PYTHON = '你的 python.exe 完整路径'`；Linux 使用 `COURSE_PYTHON=python3 node check_browser.cjs`。脚本自动启动随机本机端口、创建临时数据库、测试后停止自身服务。临时目录保留数据库与截图供排错，不应加入 Git；本课程项目已忽略 node_modules 和包管理生成文件。

2026-11-08：Windows Python 3.14、Node 26、Chromium 实测通过页面 CRUD、重载、409 保留输入、用户文本按文本显示、删除确认、分页、末页回退、离线恢复、390 像素手机宽度和 Node 读取；桌面与手机截图已检查。第七单元独立 HTML 示例与三个 JavaScript 示例也通过。尚未覆盖其他浏览器或生产并发。

## 第八单元：真实任务执行

新增 jobs.py（持久队列、领取与状态审计）、task_worker.py（固定只读任务）、check_jobs.py（隔离验证）。服务启动后自动启动两个工作线程，最多接收 20 个等待或运行任务。

```text
python check_jobs.py
```

网页任务区可提交“平台本机磁盘容量”，或填写已经登记的 IPv4 资产编号做 TCP 检查。平台本机磁盘并非远程资产磁盘。提交返回 202，随后查询任务才知道成功、失败或超时。页面轮询当前选中的任务，终态停止；网络错误后可刷新。

| 接口 | 输入或用途 |
| --- | --- |
| GET /api/tasks | 可用任务白名单 |
| POST /api/jobs | `{"task":"disk_usage","asset_id":null}` 或 `{"task":"tcp_connect","asset_id":1}` |
| GET /api/jobs | 最近 20 条任务 |
| GET /api/jobs/1 | 状态、输入快照、结果与事件 |

状态为 queued、running、succeeded、failed、timed_out。历史任务不支持通过接口修改或删除。TCP 子进程连接等待 2 秒，外层子进程执行限时 3 秒；队列满返回 429。仅支持已登记 IPv4，不接受任意命令或脚本路径。

同一个数据库只能启动一个任务引擎，依靠操作系统文件锁实现。正常关闭会等当前有限时长检查结束；重启将遗留 running 标成结果未知的 failed，保留 queued。不要在运行中删除锁文件或用数据库硬链接启动第二个实例。

2026-11-08：Windows 与 WSL Linux 的 check_jobs.py 均通过，包含三个独立课程示例、真实 TCP 成功与拒绝、本机磁盘、白名单拒绝、状态事件、容量、单引擎锁、恢复、真实子进程超时和两线程并发。恢复使用预置状态后重建引擎，并发使用受控执行器；不宣称断电或进程树故障已经验证。浏览器真实提交磁盘与 TCP 任务、轮询结果和错误提示通过，已检查桌面及手机截图。

未决项：生产运行仍需后续评审；备份恢复已在第九单元补充。结果保存失败可能留下 running，需核对后恢复；尚无心跳租约、自动重派和历史保留策略。不要将学习版直接开放到公网。

## 第九单元：带登录的入口

[登录权限课程](../../第九单元-登录权限与部署.md)的身份部分已完成，[部署备份补充课](../../第九单元补充-部署备份与恢复.md)提供操作手册、模板和恢复工具。使用新入口 secure_server.py，不要把基础课程的 server.py 当作带身份验证的服务。

```text
python auth.py --db secure.sqlite3 --username myadmin --role admin
python secure_server.py --db secure.sqlite3 --port 8096
```

第一条交互输入密码，重复同一用户名会重置密码/角色并撤销旧会话。第二条启动后访问 `http://127.0.0.1:8096/`。用户创建与启动必须指向同一数据库。无默认账户、无公开注册；不要把密码作为命令行参数或提交进 Git。

viewer 可读；operator 可读和提交任务；admin 可维护资产。所有角色可读全部资产与任务，本项目尚未实现资源级隔离。浏览器显示的角色不是授权依据，实际授权在服务端。

Auth 使用随机盐和 PBKDF2-HMAC-SHA256，sessions 仅存随机令牌摘要；会话固定一小时，每用户一个有效会话。POST /api/login 要求 JSON、配置 Origin 和 X-Requested-With: ops-course；GET /api/me 返回身份及 CSRF；后续写请求要求相同 Origin 与 X-CSRF-Token；POST /api/logout 撤销会话。Host 与配置公开地址严格匹配。Cookie 有 HttpOnly、SameSite=Strict；HTTPS origin 才加 Secure。当前未验证真实 TLS。

资产审计增加 actor，任务增加 submitted_by。旧记录迁移为 legacy-unknown；本机无身份课程写入标记 local-course。登录等事件存 auth_events。尚无完整审计浏览页面。

```text
python check_auth.py
```

PowerShell 可设置 `$env:COURSE_AUTH_TEST = '1'` 再运行 `node check_browser.cjs`，验证后用 `Remove-Item Env:COURSE_AUTH_TEST` 恢复基础模式。测试自行创建临时账户，不接触实际密码。旧 Node 只读客户端未添加认证，访问安全入口收到 HTTP 401 是预期结果。

2026-11-08：身份测试在 Windows 与 WSL Linux 通过；浏览器完成登录、CRUD、任务结果和退出；无登录模式回归通过。密码教学示例已运行。代理/TLS 实际运行未验证，详见课程建设清单。

## 部署、备份和恢复入口

deploy/ 提供 systemd 单位、非秘密配置示例与 Nginx HTTPS 代理模板。具体目录准备、权限、启动/停止、日志、升级/回退和证书注意事项见部署补充课。模板不是安装脚本；本次未修改系统服务。

```text
python backup.py backup --source secure.sqlite3 --destination snapshot.sqlite3
python backup.py restore --source snapshot.sqlite3 --destination recovered.sqlite3
python secure_server.py --db recovered.sqlite3 --port 8098
```

备份使用 SQLite 在线接口，目标必须是新文件。恢复撤销会话，并把未完成任务标记失败而非重放。恢复后重新登录核对数据，再考虑停机切换；不要覆盖运行中的数据库。Windows 检查目录 ACL，Linux 备份默认仅所有者读写。备份可能包含敏感数据，不加入 Git。

`python check_backup.py` 验证 WAL 已提交快照、恢复后的 HTTP 登录/数据、会话撤销、不重放任务、防覆盖、损坏源等。`python3 check_lifecycle.py` 在 Linux 验证真实进程 SIGTERM 收尾、退出码、重启数据和会话保留、日志不含测试秘密。安全入口现在输出简洁请求事件到标准错误，便于 journalctl 查看。

2026-11-08：Windows/Linux 恢复演练通过；Linux 生命周期通过；systemd-analyze verify 返回 0，WSL 挂载文件权限警告已在手册说明。当前没有 Nginx，所以 Nginx/TLS 运行未验证，也未安装 systemd 服务或修改全局信任库。
