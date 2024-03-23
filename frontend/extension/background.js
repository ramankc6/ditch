// background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "getLinks") {
    const uniqueLinks = message.links // 假设这是从content script发送过来的唯一链接数组
    const linkContents = [] // 用于存储每个链接的内容

    uniqueLinks.forEach(link => {
      fetch(link)
        .then(response => response.text())
        .then(content => {
          linkContents.push({ link: link, content: content })
        })
        .catch(error => console.log('Fetching failed for', link, error))
    })

  }
  return true
});


