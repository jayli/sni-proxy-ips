## 手工获取 SNI 反代服务器

1. ip.txt 是给 vps 定时探测任务喂的可用 ip 列表的备份，不是必须
2. chrome-ext：浏览器一键提取 ip 插件

### 1）chrome 插件安装

进入 chrome 插件页面：

```
chrome://extensions/
```

打开”开发者模式“开关，源码方式导入插件：

<img width="400" alt="image" src="https://github.com/user-attachments/assets/fe5f606f-1ecb-49ab-b448-52623d802263" />

### 2）搜索可用 IP

- [https://www.shodan.io/](https://www.shodan.io/)里搜索 `port:80 http.status:503 "Service Temporarily Unavailable" "Content-Type: text/html" "Connection: close" -"Content-Length:" country:"US" -hostname  -"Server"`
- [https://fofa.info/](https://fofa.info/) 里搜 `body="Backend not available" && country="US" && asn!="13335" && asn!="203637" && asn!="31898" && asn!="61112" && asn!="148680" && asn!="153914" && header!="Content-Length" && header="Connection: close" && port="80"`

用插件提取 IP 即可，检测通过后直接复制在 ip.txt 里。

<img width="400" alt="image" src="https://github.com/user-attachments/assets/7a512b28-39da-4724-a368-9738ebd8ecd4" />

### 3）命令行脚本测试 IP 连通性

<https://github.com/jayli/passwall-any/blob/main/netflix/tools/sni.js>

### 4）直接测试 IP 解锁能力

这里只是测反代服务器，还需要进一步测试 IP 是否干净，在 [passwall-any](https://github.com/jayli/passwall-any/blob/main/netflix/) 里用`npm run nf_scan`测试，一步到位。

