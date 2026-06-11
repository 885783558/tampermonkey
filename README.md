# tampermonkey

个人 [Tampermonkey](https://www.tampermonkey.net/)（篡改猴）脚本集合。每个脚本对应 `userscript/` 下的一个文件；若脚本需要外部静态资源，放在 `assets/<脚本名>/` 下。

## 目录结构

```
.
├── userscript/
│   ├── clock.js
└── assets/
    ├── clock/
    │   ├── css/
    │   ├── js/
    │   └── img/
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