# 实际下载的学习资料：精简版

日期：2026-11-08

## 背景与内容

按用户要求，从 GitHub 实际下载源文件，再筛选和删减；本目录包含 19 份下载文件（含四份许可证），不是只有链接。来源版本、原文件路径、下载时与整理后的 SHA-256 见 [下载清单](下载清单.json)。完整上游仓库不保存在本地。

| 顺序 | 作者与本地资料 | 只学这些 |
| --- | --- | --- |
| 1 | Oleksii Trekhleb：[列表](01-Python/src/data_types/test_lists.py)、[字典](01-Python/src/data_types/test_dictionaries.py)、[集合](01-Python/src/data_types/test_sets.py)、[元组](01-Python/src/data_types/test_tuples.py) | 创建、读取、修改、成员判断；assert 后面是预期结果 |
| 2 | Real Python：[客户端](02-网络/python-sockets-tutorial/echo-client.py)、[服务端](02-网络/python-sockets-tutorial/echo-server.py) | 两个进程连接、发送、接收、关闭 |
| 3 | NodeSchool / learnyounode 贡献者：[HTTP 客户端中文题目](03-Node/exercises/http_client/problem.zh-cn.md)、[答案](03-Node/exercises/http_client/solution/solution.js) | http.get、回调、data/error 事件 |
| 4 | MDN 贡献者：[浏览器取文本](04-浏览器/fetch-finish.html) | 选择内容、请求文本、显示结果 |
| 后续 | NodeSchool：[JSON API 中文题目](03-Node/exercises/http_json_api_server/problem.zh-cn.md)、[答案](03-Node/exercises/http_json_api_server/solution/solution.js) | URL 参数、返回 JSON；前三步熟悉后再读 |

## 如何快速运行

在本目录运行以下命令。Linux/WSL 使用 python3；不要在两个不同系统环境里分别启动通信双方。

```text
python 01-Python/src/data_types/test_lists.py
python 01-Python/src/data_types/test_dictionaries.py
python 01-Python/src/data_types/test_sets.py
python 01-Python/src/data_types/test_tuples.py
```

每个输出 PASS 表示保留的断言通过，不需要 pytest。删掉了推导式、复杂切片、集合运算、构造器扩展和测试框架依赖。字典原导言“unordered”不适合当前 Python，已去掉；现代 Python 字典保留插入顺序。

网络示例：先在一个终端启动服务端，再另开终端启动客户端：

```text
python 02-网络/python-sockets-tutorial/echo-server.py
python 02-网络/python-sockets-tutorial/echo-client.py
```

预期客户端显示 `Received b'Hello, world'`。这是原始 TCP，不是 HTTP，不能用浏览器页面代替客户端。服务端只处理一次连接；客户端写完后关闭发送方向，并循环收取回声直到对端关闭。已将 with、f-string、元组解包改成普通写法，并补充关闭资源与超时。

浏览器示例：

```text
python -m http.server 8092 --bind 127.0.0.1 --directory 04-浏览器
```

访问 http://127.0.0.1:8092/fetch-finish.html ，切换 Verse。四份 verse 文本是页面依赖，保留它们才能运行。已删除装饰样式，把箭头函数与模板字符串改为普通函数和字符串拼接。此例仍使用 fetch 与 then：then 注册成功后的回调，可在读完现有 XMLHttpRequest 示例后对照；没有要求先学习 async/await。

保留浏览器示例的服务，用另一个终端运行 Node 客户端：

```text
node 03-Node/exercises/http_client/solution/solution.js http://127.0.0.1:8092/verse1.txt
```

题目中的 `{rootdir:...}` 是原工作坊专用占位符，不是本地链接。直接看题目与答案即可，无须安装 learnyounode。JSON API 答案运行时需传端口，例如 `node 03-Node/exercises/http_json_api_server/solution/solution.js 8093`，再访问 `/api/parsetime?iso=2026-11-08T00:00:00Z`；返回小时受本机时区影响。

## 来源、删减与限制

- [trekhleb/learn-python](https://github.com/trekhleb/learn-python)：MIT，保留 [许可证](01-Python/LICENSE)。
- [realpython/materials](https://github.com/realpython/materials)：MIT，保留 [许可证](02-网络/LICENSE)。
- [workshopper/learnyounode](https://github.com/workshopper/learnyounode)：MIT，保留 [许可证](03-Node/LICENSE.md)。
- [mdn/learning-area](https://github.com/mdn/learning-area)：CC0，保留 [许可证](04-浏览器/LICENSE)。

只下载上述主题文件；没有下载进阶网络、多连接项目、其他语言题目、全套课程或依赖目录。Python 与浏览器文件已明确标记本地删改；Node 中文题目和答案保持下载版本。下载原始哈希用于追溯，当前文件哈希用于校验，不应将修改版当作作者原版。

待办：按顺序跑例子并修改一个输入；再回到 [三个最小任务](../04-练习与验收.md)。这些是学习示例，不作为生产服务。

## 本次验证

四个 Python 容器示例和 TCP 客户端、服务端收发均实际运行通过。两份 Node 答案和浏览器内联脚本语法检查通过；19 个下载文件的整理后哈希全部匹配清单。浏览器点击与 Node 网络交互未在本次实测。
