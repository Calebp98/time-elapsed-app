// Save options to chrome.storage
function saveOptions(e) {
  e.preventDefault();
  const message = document.getElementById("message").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const targetDate = new Date(date + "T" + time).toISOString();

  chrome.storage.sync.set(
    { message: message, targetDate: targetDate },
    function () {
      // Update status to let user know options were saved
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 2000);
    }
  );
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get({ message: "", targetDate: "" }, function (items) {
    document.getElementById("message").value = items.message;
    if (items.targetDate) {
      const date = new Date(items.targetDate);
      document.getElementById("date").value = date.toISOString().split("T")[0];
      document.getElementById("time").value = date
        .toTimeString()
        .split(" ")[0]
        .substr(0, 5);
    }
  });
}

// Add event listeners
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("optionsForm").addEventListener("submit", saveOptions);
