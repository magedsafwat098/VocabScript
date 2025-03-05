// By Maged Safwat
// Context Menu Setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "translate",
      title: "Translate with VocabScript",
      contexts: ["selection"]
    });
  });

  chrome.storage.local.get("autoDownload", (result) => {
    if (result.autoDownload === undefined) {
      chrome.storage.local.set({ autoDownload: true });
    }
  });
});

// Context Menu Handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate" && info.selectionText) {
    translateAndSave(info.selectionText, tab);
  }
});

// Main Translation Function
async function translateAndSave(word, tab) {
  try {
    const { apiKey } = await chrome.storage.local.get(["apiKey"]);
    if (!apiKey) return;

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: word,
          source: 'en',
          target: 'ar',
          format: 'text'
        })
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const translation = data?.data?.translations?.[0]?.translatedText;
    if (!translation) throw new Error("Invalid translation response");

    const { translations = [], autoDownload = true } = await chrome.storage.local.get(["translations", "autoDownload"]);

    const newEntry = {
      id: Date.now().toString(),
      word: word,
      translation: translation,
      timestamp: new Date().toISOString().split('T')[0]
    };

    await chrome.storage.local.set({ translations: [newEntry, ...translations] });

    // Send to content script with error handling
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showTranslation",
          word: word,
          translation: translation,
          shouldAutoDownload: autoDownload
        });
      } catch (error) {
        console.log("Context menu translation notification skipped:", error.message);
      }
    }

    if (autoDownload) downloadUsingDataUrl([newEntry, ...translations]);
  } catch (error) {
    console.error("Translation failed:", error);
  }
}

// File Download Handler
function downloadUsingDataUrl(translations) {
  const content = formatTranslationsToText(translations);
  if (!content || content === "No translations") return;

  const base64Content = btoa(unescape(encodeURIComponent(content)));
  const dataUrl = `data:text/plain;base64,${base64Content}`;

  chrome.downloads.download({
    url: dataUrl,
    filename: 'vocabscript_translations.txt',
    conflictAction: 'overwrite',
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error("Download failed:", chrome.runtime.lastError);
    }
  });
}

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "saveTranslation":
      handleSaveTranslation(request, sendResponse);
      return true;
    case "getTranslationContent":
      handleGetTranslationContent(sendResponse);
      return true;
    case "downloadTranslations":
      handleDownloadTranslations(sendResponse);
      return true;
    case "deleteTranslation":
      handleDeleteTranslation(request.id, sendResponse);
      return true;
    case "getTranslations":
      handleGetTranslations(sendResponse);
      return true;
    default:
      return false;
  }
});

// Format Translations
function formatTranslationsToText(translations) {
  if (!translations?.length) return "No translations";
  
  const WORD_WIDTH = 35;
  let content = "Word".padEnd(WORD_WIDTH) + "Translation\n";
  content += "-".repeat(80) + "\n";

  translations.forEach(item => {
    let word = item.word?.substring(0, WORD_WIDTH - 4) + (item.word?.length > WORD_WIDTH ? "..." : "") || "";
    word = word.padEnd(WORD_WIDTH);
    content += `${word}${item.translation || ""}\n`;
  });

  return content;
}

// Message Handlers
async function handleSaveTranslation(request, sendResponse) {
  const { translations = [], autoDownload = true } = await chrome.storage.local.get(["translations", "autoDownload"]);
  const newTranslations = [{
    id: Date.now().toString(),
    word: request.word,
    translation: request.translation,
    timestamp: new Date().toISOString().split('T')[0]
  }, ...translations];
  
  await chrome.storage.local.set({ translations: newTranslations });
  if (autoDownload) downloadUsingDataUrl(newTranslations);
  sendResponse({ success: true });
}

async function handleGetTranslationContent(sendResponse) {
  const { translations = [] } = await chrome.storage.local.get("translations");
  sendResponse({ content: formatTranslationsToText(translations) });
}

async function handleDownloadTranslations(sendResponse) {
  const { translations = [] } = await chrome.storage.local.get("translations");
  downloadUsingDataUrl(translations);
  sendResponse({ success: true });
}

async function handleDeleteTranslation(id, sendResponse) {
  const { translations = [], autoDownload = true } = await chrome.storage.local.get(["translations", "autoDownload"]);
  const filtered = translations.filter(item => item.id !== id);
  await chrome.storage.local.set({ translations: filtered });
  if (autoDownload && filtered.length) downloadUsingDataUrl(filtered);
  sendResponse({ success: true, remainingCount: filtered.length });
}

async function handleGetTranslations(sendResponse) {
  const { translations = [] } = await chrome.storage.local.get("translations");
  sendResponse({ translations: translations });
}