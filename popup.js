document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const wordInput = document.getElementById("wordInput");
  const translateButton = document.getElementById("translateButton");
  const translationList = document.getElementById("translationList");
  const downloadButton = document.getElementById("downloadButton");
  const clearButton = document.getElementById("clearButton");
  const autoDownloadOption = document.getElementById("autoDownloadOption");
  const apiHeader = document.getElementById("apiHeader");
  const apiSection = document.getElementById("apiSection");
  const toggleApiBtn = document.getElementById("toggleApi");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyBtn = document.getElementById("saveApiKey");
  const keyStatus = document.getElementById("keyStatus");

  let isApiCollapsed = false;

  // API Section Toggle
  apiHeader.addEventListener("click", function () {
    isApiCollapsed = !isApiCollapsed;
    apiSection.classList.toggle("collapsed");
    toggleApiBtn.textContent = isApiCollapsed ? "▼" : "▲";
    chrome.storage.local.set({ apiCollapsed: isApiCollapsed });
  });

  // Load Initial State
  chrome.storage.local.get(["apiKey", "apiCollapsed", "autoDownload"], function (result) {
    // API Key
    if (result.apiKey) apiKeyInput.value = result.apiKey;
    
    // Collapse State
    if (result.apiCollapsed) {
      apiSection.classList.add("collapsed");
      toggleApiBtn.textContent = "▼";
      isApiCollapsed = true;
    }
    
    // Auto-Download Toggle
    if (result.autoDownload !== undefined) {
      autoDownloadOption.checked = result.autoDownload;
    }
  });

  // Save API Key
  saveApiKeyBtn.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showKeyStatus("Please enter an API key", "error");
      return;
    }

    chrome.storage.local.set({ apiKey: apiKey }, function () {
      showKeyStatus("✓ Key saved!", "success");
      if (!isApiCollapsed) setTimeout(() => apiHeader.click(), 1000);
    });
  });

  // Auto-Download Toggle
  autoDownloadOption.addEventListener("change", function () {
    chrome.storage.local.set({ autoDownload: this.checked });
  });

  // Event Listeners
  translateButton.addEventListener("click", handleTranslation);
  downloadButton.addEventListener("click", () => chrome.runtime.sendMessage({ action: "downloadTranslations" }));
  clearButton.addEventListener("click", clearTranslations);

  // Initial Load
  loadTranslations();

  async function handleTranslation() {
    const word = wordInput.value.trim();
    if (!word) {
      showKeyStatus("Please enter a word to translate", "error");
      return;
    }

    try {
      const translation = await translateWord(word);
      chrome.runtime.sendMessage(
        { action: "saveTranslation", word: word, translation: translation },
        (response) => {
          if (response?.success) {
            loadTranslations();
            showKeyStatus("Translation saved!", "success");
          }
          wordInput.value = "";
        }
      );
    } catch (error) {
      showKeyStatus("Translation failed. Check API key", "error");
    }
  }

  async function translateWord(word) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["apiKey"], function (result) {
        if (!result.apiKey) {
          reject(new Error("No API key saved"));
          return;
        }

        fetch(`https://translation.googleapis.com/language/translate/v2?key=${result.apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: word,
            source: "en",
            target: "ar",
            format: "text"
          })
        })
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            if (data?.data?.translations?.[0]?.translatedText) {
              resolve(data.data.translations[0].translatedText);
            } else {
              reject(new Error("Invalid translation response"));
            }
          })
          .catch(reject);
      });
    });
  }

  function loadTranslations() {
    chrome.runtime.sendMessage({ action: "getTranslations" }, (response) => {
      translationList.innerHTML = "";
      
      if (!response?.translations?.length) {
        translationList.innerHTML = `
          <div class="empty-message">
            No translations yet. Start translating!
          </div>
        `;
        return;
      }

      response.translations.forEach(item => {
        const listItem = document.createElement("li");
        listItem.dataset.id = item.id;
        
        listItem.innerHTML = `
          <div class="translation-text">
            ${item.word} => ${item.translation}
            <span style="font-size:10px; color:#666; display:block; margin-top:2px;">
              ${item.timestamp || ""}
            </span>
          </div>
          <div class="delete-btn">×</div>
        `;

        listItem.querySelector(".delete-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          deleteTranslation(item.id, item.word);
        });

        translationList.appendChild(listItem);
      });
    });
  }

  function deleteTranslation(id, word) {
    if (!confirm(`Delete translation for "${word}"?`)) return;
    
    const listItem = translationList.querySelector(`[data-id="${id}"]`);
    if (listItem) listItem.style.opacity = "0.5";

    chrome.runtime.sendMessage({ action: "deleteTranslation", id: id }, (response) => {
      if (response?.success) {
        listItem?.remove();
        if (response.remainingCount === 0) {
          translationList.innerHTML = `
            <div class="empty-message">
              No translations yet. Start translating!
            </div>
          `;
        }
      }
    });
  }

  function clearTranslations() {
    if (!confirm("Clear ALL translations?")) return;
    chrome.storage.local.set({ translations: [] }, () => loadTranslations());
  }

  function showKeyStatus(message, type) {
    keyStatus.textContent = message;
    keyStatus.style.color = type === "error" ? "#ff4444" : "#00aa00";
    setTimeout(() => (keyStatus.textContent = ""), 3000);
  }
});