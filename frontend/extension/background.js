chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "foundLinks" && message.links.length > 0) {
    chrome.storage.local.set({ links: message.links }, function () {
      console.log("Links saved.")
      // 发送一个通知给用户
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: '发现链接',
        message: '点击查看与"privacy"相关的链接。',
        priority: 2
      })
    })
  }
})
