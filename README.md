## 获取 SNI 反代服务器

1. ip.txt 是给 vps 定时探测任务喂的可用 ip 列表
2. chrome-ext 是浏览器一键提取 ip 插件

### 1）chrome 插件安装

进入 chrome 插件页面：

```
chrome://extensions/
```

打开”开发者模式“开关，源码方式导入插件：

<img width="500" alt="image" src="https://github.com/user-attachments/assets/fe5f606f-1ecb-49ab-b448-52623d802263" />

### 2）搜索可用 IP

[https://www.shodan.io/](https://www.shodan.io/)里搜索 `port:80 http.status:503 "Service Temporarily Unavailable" "Content-Type: text/html" "Connection: close" -"Content-Length:" country:"US" -hostname  -"Server"`

用插件提取 IP 即可，检测通过后直接复制在 ip.txt 里。

<img width="400" alt="image" src="https://github.com/user-attachments/assets/d1c7ad98-cd64-48b8-b2a9-3641440ea945" />


