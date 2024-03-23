// content.js
function searchLinks () {
  const searchTerm = "privacy"
  const links = document.querySelectorAll('a')
  const uniqueLinks = new Set()

  links.forEach(link => {
    if (link.href.toLowerCase().includes(searchTerm) || link.textContent.toLowerCase().includes(searchTerm)) {
      uniqueLinks.add(link.href)
    }
  })

  return Array.from(uniqueLinks)
}

function sendDataToServer (data) {
  fetch('YOUR_SERVER_ENDPOINT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch((error) => console.error('Error:', error))
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "getLinks") {
      uniqueLinks = searchLinks()
      sendDataToServer({ links: uniqueLinks })
      sendResponse({ links: uniqueLinks })
    }
  }
)
