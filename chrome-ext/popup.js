// 保存提取到的数据，供后续使用
let extractedData = [];

// 获取当前活跃标签页
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const statusEl = document.getElementById('status');
  const resultEl = document.getElementById('result');
  const copyButton = document.getElementById('copyButton');
  const checkButton = document.getElementById('checkButton');

  // 安全检查：只处理 http/https 页面
  if (!tab.url || !/^https?:/.test(tab.url)) {
    statusEl.textContent = '❌ 仅支持网页（http/https）';
    statusEl.className = 'error';
    return;
  }

  // 动态注入脚本到页面，获取 div.result a.title 的内容
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        // 在页面上下文中执行
        const links = document.querySelectorAll('div.result a.title');
        
        if (links.length === 0) {
          return { success: false, error: "未找到匹配的元素" };
        }

        // 提取所有链接的文本内容
        const texts = Array.from(links)
          .map(link => link.textContent.trim())
          .filter(text => text.length > 0);

        if (texts.length === 0) {
          return { success: false, error: "未提取到有效文本" };
        }

        return { 
          success: true, 
          data: texts,
          count: texts.length
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
      statusEl.textContent = `✅ 成功提取 ${result.count} 项内容`;
      statusEl.className = 'success';
      copyButton.disabled = false;
      checkButton.disabled = false;

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
    }
  );
});