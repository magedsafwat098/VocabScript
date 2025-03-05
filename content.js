// VOCABSCRIPT CONTENT SCRIPT - COMPLETE
console.log("VocabScript content script loaded");

// ======================
// STYLES
// ======================
const style = document.createElement('style');
style.textContent = `
  .vocabscript-popup {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: white !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    padding: 15px !important;
    z-index: 2147483647 !important;
    max-width: 300px !important;
    font-family: Arial, sans-serif !important;
    animation: vocabscript-fadein 0.3s ease-in !important;
  }
  
  @keyframes vocabscript-fadein {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// ======================
// MESSAGE HANDLING
// ======================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Content] Received message:", request.action);
  
  if (request.action === "showPopup") {
    showTranslationPopup(request.word, request.translation);
  }
  return true;
});

// ======================
// POPUP MANAGEMENT
// ======================
function showTranslationPopup(word, translation) {
  // Remove existing popups
  const existingPopups = document.querySelectorAll('.vocabscript-popup');
  existingPopups.forEach(popup => popup.remove());

  // Create new popup
  const popup = document.createElement('div');
  popup.className = 'vocabscript-popup';
  popup.innerHTML = `
    <div style="
      color: #0066dd;
      font-weight: bold;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      margin-bottom: 10px;
    ">
      VocabScript Translation
    </div>
    <div style="margin-bottom:8px;">
      <div style="font-weight:bold;">${word}</div>
      <div style="direction:rtl; text-align:right; margin-top:5px; font-family:'Segoe UI';">${translation}</div>
    </div>
  `;

  // Add to page
  document.body.appendChild(popup);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 300);
  }, 5000);
}