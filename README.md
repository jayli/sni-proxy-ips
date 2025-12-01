## 获取 SNI 反代服务器

1. ip.txt 是给 vps 定时探测任务喂的可用 ip 列表
2. chrome-ext 是浏览器一键提取 ip 插件

### 1）chrome 插件安装

进入 chrome 插件页面：

```
chrome://extensions/
```

打开”开发者模式“开关，源码方式导入插件：

<img width="400" alt="image" src="https://github.com/user-attachments/assets/fe5f606f-1ecb-49ab-b448-52623d802263" />

### 2）搜索可用 IP

[https://www.shodan.io/](https://www.shodan.io/)里搜索 `port:80 http.status:503 "Service Temporarily Unavailable" "Content-Type: text/html" "Connection: close" -"Content-Length:" country:"US" -hostname  -"Server"`

用插件提取 IP 即可，检测通过后直接复制在 ip.txt 里。

<img width="400" alt="image" src="https://github.com/user-attachments/assets/7a512b28-39da-4724-a368-9738ebd8ecd4" />

### 3）命令行脚本测试 IP 连通性

[sni.js](https://github.com/jayli/passwall-any/blob/main/netflix/sni.js)

### 4）直接测试 IP 解锁能力

这里只是测反代服务器，还需要进一步测试 IP 的解锁能力，在 [passwall-any](https://github.com/jayli/passwall-any/blob/main/netflix/) 里用脚`npm run scan`本测，一步到位。

