# 项目 03：可替换检查器

日期：2026-11-08

背景：用真实磁盘检查与文件存在检查学习实例、继承、组合和模块拆分。无第三方依赖。

在本目录运行：

```text
python main.py --file README.md --disk-path . --threshold 80
python check_project.py
```

Linux 使用 python3。JSON 中每项具有 name/status/detail。退出码 0 正常，1 有告警，2 有运行错误或配置无效。磁盘结果取决于实际机器；传 --threshold 0 可明确触发磁盘告警。

文件不存在会产生 alert；磁盘路径不可访问会产生 error。FileCheck 仅判断普通文件是否存在，不验证是否有权限读全部内容。多个检查顺序执行，不是并行；真实检查错误转为结构化结果后仍继续下一个检查。

阅读顺序：main 组装 → Runner.run_all → BaseCheck.run → 子类 evaluate → exit_code。约定的输入校验在业务代码里使用 if/raise；check_project 中的 assert 仅用于测试。

待办：完成第四单元的非空文件检查器与汇总练习。来源为本地教学设计，依据链接见第四单元。

验证：WSL Python 运行 check_project.py 通过，覆盖实例配置隔离、父类分派到子类、组合非继承对象、输入列表改变不影响运行器、结果契约、读取失败后继续、未实现方法暴露、真实文件与磁盘检查、非法阈值、CLI 退出码及导入入口无输出。第四单元六个独立教学代码块也已实际执行。尚未引入并发或网络，这些不在本项目验证范围。
