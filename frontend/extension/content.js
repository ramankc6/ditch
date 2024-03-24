// content.js
function searchLinks () {
  const searchTerms = ["term"]
  const links = document.querySelectorAll('a')
  const uniqueLinks = new Set()
  searchTerms.forEach(searchTerm => {
    links.forEach(link => {
      if (link.href.toLowerCase().includes(searchTerm) || link.textContent.toLowerCase().includes(searchTerm)) {
        uniqueLinks.add(link.href)
      }
    })
  })

  return Array.from(uniqueLinks).filter(link => link != "https://policies.google.com/terms")
}

function sendDataToServer (data) {
  console.log(data)
  fetch('https://ditch.live:3001/api/getTOS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "url": data.links[0] })
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
