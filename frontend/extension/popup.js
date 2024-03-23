// popup.js
document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getLinks" }, function (response) {
      const container = document.getElementById('results')
      if (response && response.links.length > 0) {
        response.links.forEach(link => {
          const div = document.createElement('div')
          const a = document.createElement('a')
          a.href = link
          a.textContent = link
          a.target = "_blank"
          div.appendChild(a)
          container.appendChild(div)
        })
      } else {
        container.textContent = "No matching links found."
      }
    })
  })
})
