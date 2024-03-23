// content.js
function searchLinks () {
  const searchTerm = "privacy"
  const links = document.querySelectorAll('a')
  const matchingLinks = []

  links.forEach(link => {
    if (link.href.toLowerCase().includes(searchTerm) || link.textContent.toLowerCase().includes(searchTerm)) {
      matchingLinks.push(link.href)
    }
  })

  return matchingLinks
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "getLinks") {
      sendResponse({ links: searchLinks() })
    }
  }
)
