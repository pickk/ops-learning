# 项目 04：网站巡检与结果 API

日期：2026-11-08

在本目录启动 `python server.py`，另一个终端运行 `python client.py`。Linux 使用 python3。默认服务位于 127.0.0.1:8094，只检查预定义 self 健康接口。

浏览器访问 http://127.0.0.1:8094/api/results 可以查看最近一批结果。

命令行批量模式：

```text
python client.py --url http://127.0.0.1:8094/api/health --url http://127.0.0.1:8094/missing
```

预期一条 ok、一条 alert。CLI 返回 0 为全部正常，1 为检查结果含异常或 API 非 200，2 为调用/解析错误。仅访问你有权限的目标。

接口：GET /api/health、GET /api/results、POST /api/checks。POST 请求体为 `{"ids":["self"]}`，Content-Type 为 application/json。接口只接受已定义目标名称，不接收任意 URL。单次 1—5 项，一个批次运行期间其他批次返回 409。

结果字段：id、url、status、http_status、reason、elapsed_ms。ok 表示收到 2xx 响应头；alert 表示收到非 2xx；error 表示连接、协议、超时或地址错误。elapsed_ms 是该检查观测耗时，不是完整页面加载时间。

不自动跟随重定向、不自动重试、不验证响应正文。默认网络超时是操作超时，不是严格任务总时限。结果只在内存，重启后为空。教学服务不提供登录、数据库或后台队列。

运行 `python check_project.py` 验证本机目标与 API；不依赖外网。WSL Python 已通过：HTTP 成功、404、302 不跟随、超时、关闭端口连接失败、URL 协议与凭据拒绝、POST 校验、大小和媒体类型限制、结果查询、占用锁及释放、真实客户端自检和批量 CLI 退出码。占用测试主动持有锁，未声称完成并发压力测试。HTTPS 证书链、DNS 故障和浏览器操作未在本阶段验证。

待办：完成第五单元练习，并在第六单元学习持久化。来源为本地编写，文档依据见第五单元。
