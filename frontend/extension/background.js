// background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "getLinks") {
    const uniqueLinks = message.links
    const linkContents = []

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


