document.addEventListener('DOMContentLoaded', function () {
  const infoForm = document.getElementById('infoForm');
  const resultsDiv = document.getElementById('results'); // Assuming you have this in your HTML

  infoForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    chrome.storage.sync.set({ userName: name, userEmail: email }, function() {
      infoForm.style.display = 'none';

      // Start Link Finding Logic
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getLinks" }, function (response) {
          if (response && response.links.length > 0) {
            response.links.forEach(link => {
              const div = document.createElement('div');
              const a = document.createElement('a');
              a.href = link;
              a.textContent = link;
              a.target = "_blank";
              div.appendChild(a);
              resultsDiv.appendChild(div);
            });
          } else {
            resultsDiv.textContent = "No matching links found.";
          }
        });
      });  
    });
  });
});
