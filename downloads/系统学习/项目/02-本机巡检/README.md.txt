# 项目 02：本机巡检 CLI

日期：2026-11-08

背景：把数据处理脚本变成带配置、参数、日志和退出码的工具。读取真实磁盘状态，扫描样例日志；不会修改系统配置或自动清理磁盘。

```text
python inspect_host.py --help
python inspect_host.py --config config.json --dry-run
python inspect_host.py --config config.json --output report.json --verbose
```

Linux/WSL 使用 python3。在其他目录运行时给脚本与配置绝对路径。配置内相对路径相对于配置文件目录；输出相对于当前目录。

退出码：0 无告警，1 检查成功但发现磁盘或日志告警，2 配置/输入/输出/参数等运行错误。样例有一条 ERROR，所以通常返回 1，这不是测试失败。

报告包含 alert、disk.used_percent、disk.warning_percent、disk.alert、log.lines、log.error_lines。磁盘比例随实际机器变化，不固定；样例日志固定三行、一条错误。

报告使用同目录临时文件和 os.replace，避免普通写入中途失败破坏旧文件。拒绝报告覆盖配置、输入日志或它们的硬链接。--dry-run 执行读取但不写报告。没有指定 --output 时也仅打印。

限制：日志格式固定为“时间 级别 消息”，全文件扫描；不提供增量游标、远程探测、并发任务管理或完整宕机持久性保证。定时与文件权限练习见第三单元，不自动安装服务。

待办：完成 error_warning_count 扩展；对真实日志使用前先确认格式。来源为本地教学代码；标准库依据见第三单元。

验证：运行 `python check_project.py`，在临时目录检查真实磁盘读取、日志统计、重复运行、dry-run、配置/日志覆盖拒绝、硬链接保护、缺失输出目录、环境变量与参数优先级、非法阈值、缺失配置及损坏 JSON，全部通过。验证脚本不更改系统配置。尚未模拟磁盘写满、权限拒绝、并发写入或实际安装定时任务；这些不属于已通过声明。
