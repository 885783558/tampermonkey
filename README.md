# tampermonkey

个人 [Tampermonkey](https://www.tampermonkey.net/)（篡改猴）脚本集合。每个脚本对应 `userscript/` 下的一个文件；若脚本需要外部静态资源，放在 `assets/<脚本名>/` 下。

## 目录结构

```
.
├── userscript/
│   ├── clock.js
│   ├── jenkins.js
│   └── zadig.js
└── assets/
    ├── clock/
    │   ├── css/
    │   ├── js/
    │   └── img/
    ├── jenkins/
    └── zadig/
```

新增脚本时，建议：

1. 在 `userscript/` 添加 `<name>.js`
2. 若需要 CSS / JS / 图片等，在 `assets/<name>/` 下按类型分子目录
3. 在脚本内用 jsDelivr 引用资源，例如：

```javascript
const REPO = '885783558/tampermonkey';
const BASE_URL = 'https://cdn.jsdelivr.net/gh/' + REPO + '@main/';
const ASSETS = BASE_URL + 'assets/clock/';
// ASSETS + 'css/style.css'
```

## 安装脚本

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展
2. 打开对应 `userscript/*.js`，复制全部内容到 Tampermonkey「新建脚本」并保存

依赖 CDN 资源的脚本（如 `clock.js`）需将本仓库推送到 GitHub 后，jsDelivr 才能访问 `assets/` 下的文件。

## 脚本说明

| 脚本 | 文件 | 说明 |
|------|------|------|
| 太空人表盘挂件 | `userscript/clock.js` | 在任意网页显示可拖拽、缩放的太空人表盘 |
| Zadig 项目过滤 | `userscript/zadig.js` | 在 Zadig 项目页按白名单过滤卡片 |
| Jenkins | `userscript/jenkins.js` | （待补充说明） |

## 仓库更名说明

本项目由单脚本仓库 `space-astronaut-clock` 重构为通用脚本集合 `tampermonkey`。GitHub 上需将仓库重命名为 `tampermonkey`，并更新本地 remote：

```bash
git remote set-url origin git@github.com:885783558/tampermonkey.git
```
