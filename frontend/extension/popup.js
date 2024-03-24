document.addEventListener('DOMContentLoaded', function () {
  const infoForm = document.getElementById('infoForm');
  const resultsDiv = document.getElementById('results'); // Assuming you have this in your HTML
  const ditchImage = document.getElementById('ditch-logo'); 

  ditchImage.addEventListener('click', () => {
    chrome.tabs.create({ url: "https://www.ditch.live" });
  });

  infoForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const payment = document.getElementById('payment').value;
  

    chrome.storage.sync.set({ userEmail: email, companyName: name, phoneNumber: phone, monthlyPayment: payment}, function() {
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
