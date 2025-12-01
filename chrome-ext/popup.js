// 保存提取到的数据，供后续使用
let extractedData = [];

// 获取当前活跃标签页
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const statusEl = document.getElementById('status');
  const resultEl = document.getElementById('result');
  const copyButton = document.getElementById('copyButton');
  const checkButton = document.getElementById('checkButton');
  const netflixButton = document.getElementById('netflixButton');

  // 安全检查：只处理 http/https 页面
  if (!tab.url || !/^https?:/.test(tab.url)) {
    statusEl.textContent = '❌ 仅支持网页（http/https）';
    statusEl.className = 'error';
    return;
  }

  // IPv4地址验证正则表达式
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

  // 动态注入脚本到页面，获取 div.result a.title 和 div.hsxa-meta-data-item a.hsxa-jump-a 的内容
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        // 在页面上下文中执行
        
        // 提取原有的链接文本
        const titleLinks = document.querySelectorAll('div.result a.title');
        const titleTexts = Array.from(titleLinks)
          .map(link => link.textContent.trim())
          .filter(text => text.length > 0);

        // 提取新的链接文本 (注意修正后的选择器)
        const jumpLinks = document.querySelectorAll('div.hsxa-meta-data-item a.hsxa-jump-a');
        const jumpTexts = Array.from(jumpLinks)
          .map(link => link.textContent.trim())
          .filter(text => text.length > 0);

        // 合并两个数组并去重
        const allTexts = [...titleTexts, ...jumpTexts];
        const uniqueTexts = [...new Set(allTexts)]; // 使用Set去除重复项
        
        // 过滤出符合IPv4格式的地址
        const ipv4Texts = uniqueTexts.filter(text => {
          // 基本格式检查
          if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(text)) {
            return false;
          }
          
          // 详细检查每个数字部分是否在0-255范围内
          const parts = text.split('.');
          return parts.every(part => {
            const num = parseInt(part, 10);
            return num >= 0 && num <= 255 && part === num.toString();
          });
        });

        if (ipv4Texts.length === 0) {
          return { success: false, error: "未提取到有效文本" };
        }

        return { 
          success: true, 
          data: ipv4Texts,
          count: ipv4Texts.length
        };
      }
    },
    (injectionResults) => {
      // 检查执行是否失败
      if (chrome.runtime.lastError) {
        console.error('执行失败:', chrome.runtime.lastError);
        statusEl.textContent = '❌ 无法访问页面内容';
        statusEl.className = 'error';
        return;
      }

      // 获取返回结果
      const result = injectionResults?.[0]?.result;

      if (!result) {
        statusEl.textContent = '❌ 未获取到结果';
        statusEl.className = 'error';
        return;
      }

      if (!result.success) {
        statusEl.textContent = `⚠️ ${result.error}`;
        statusEl.className = 'error';
        resultEl.textContent = '';
        return;
      }

      // 保存提取的数据
      extractedData = result.data;

      // 显示成功结果
      const content = result.data.join('\n');
      resultEl.textContent = content;
      statusEl.textContent = `✅ 成功提取 ${result.count} 个 IP`;
      statusEl.className = 'success';
      copyButton.disabled = false;
      checkButton.disabled = false;
      netflixButton.disabled = false; 

      // 为复制按钮添加事件监听器
      copyButton.onclick = () => {
        navigator.clipboard.writeText(content)
          .then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = '已复制!';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 2000);
          })
          .catch(err => {
            statusEl.textContent = `❌ 复制失败: ${err.message}`;
            statusEl.className = 'error';
          });
      };

      // 为检测可用性按钮添加事件监听器
      checkButton.onclick = () => {
        // 构造URL，将IP列表用逗号连接
        const ips = extractedData.join(',');
        const url = `http://yui.cool:7001/sni?ips=${ips}`;
        
        // 在新标签页中打开URL
        chrome.tabs.create({ url: url });
      };

      netflixButton.onclick = () => {
        const ips = extractedData.join(',');
        const url = `http://yui.cool:7001/nf?ips=${ips}`;
        chrome.tabs.create({ url: url });
      };
    }
  );
});