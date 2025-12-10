// ===============================
// Quotes Data
// ===============================
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "JavaScript is the language of the web.", category: "Technology" },
  { text: "Success is not final, failure is not fatal.", category: "Inspiration" }
];

// ===============================
// DOM Elements
// ===============================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ===============================
// Show Random Quote
// ===============================
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <strong>— ${quote.category}</strong>
  `;

  // Save the last viewed quote index to sessionStorage (session-specific)
  try {
    sessionStorage.setItem('lastViewedIndex', String(randomIndex));
  } catch (e) {
    console.warn('Session storage not available:', e);
  }
}

// ===============================
// Create Add Quote Form (REQUIRED)
// ===============================
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  // Add quote on button click
  addButton.addEventListener("click", function () {
    addQuote();
  });

  // ===== Add Import / Export controls =====
  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes (JSON)";
  exportButton.style.marginLeft = "8px";
  exportButton.addEventListener("click", exportToJson);

  const importLabel = document.createElement("label");
  importLabel.textContent = "Import Quotes (JSON): ";
  importLabel.style.marginLeft = "12px";

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json,application/json";
  // When a file is chosen, call importFromJsonFile
  importInput.addEventListener("change", importFromJsonFile);

  // Append elements
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // container for import/export
  const ioContainer = document.createElement("div");
  ioContainer.style.marginTop = "10px";
  ioContainer.appendChild(exportButton);
  ioContainer.appendChild(importLabel);
  ioContainer.appendChild(importInput);

  formContainer.appendChild(ioContainer);

  // small info for session behavior
  const sessionInfo = document.createElement("p");
  sessionInfo.style.fontSize = "12px";
  sessionInfo.style.opacity = "0.9";
  sessionInfo.textContent = "Last viewed quote is stored for this browser session only.";
  formContainer.appendChild(sessionInfo);

  document.body.appendChild(formContainer);
}

// ===============================
// Add Quote Function
// ===============================
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({
    text: quoteText,
    category: quoteCategory
  });

  // ✅ Update categories when a new quote is added
  populateCategories();


  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Persist to localStorage whenever a new quote is added
  saveQuotes();

  alert("Quote added successfully!");
}

// ===============================
// Web Storage: Save / Load
// ===============================
function saveQuotes() {
  try {
    const serialized = JSON.stringify(quotes);
    localStorage.setItem('quotesData', serialized);
  } catch (e) {
    console.warn('Could not save quotes to localStorage:', e);
  }
}

function loadQuotes() {
  try {
    const stored = localStorage.getItem('quotesData');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // clear existing default array contents without reassigning const
        quotes.length = 0;
        parsed.forEach(q => {
          // validate shape before pushing
          if (q && typeof q.text === 'string' && typeof q.category === 'string') {
            quotes.push({ text: q.text, category: q.category });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Could not load quotes from localStorage:', e);
  }
}

// Optionally restore last viewed quote from sessionStorage on load
function restoreLastViewedQuote() {
  try {
    const idx = sessionStorage.getItem('lastViewedIndex');
    if (idx !== null) {
      const index = parseInt(idx, 10);
      if (!Number.isNaN(index) && quotes[index]) {
        const quote = quotes[index];
        quoteDisplay.innerHTML = `
          <p>"${quote.text}"</p>
          <strong>— ${quote.category}</strong>
        `;
        return;
      }
    }
  } catch (e) {
    console.warn('Could not read sessionStorage:', e);
  }

  // if nothing to restore, show default message
  quoteDisplay.textContent = 'Click the button to see a quote';
}

// ===============================
// JSON Export / Import
// ===============================
function exportToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    a.download = `quotes-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export failed:', e);
    alert('Export failed. See console for details.');
  }
}

function importFromJsonFile(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert('Imported JSON must be an array of quote objects.');
        return;
      }

      // Validate and merge quotes
      let added = 0;
      imported.forEach(item => {
        if (item && typeof item.text === 'string' && typeof item.category === 'string') {
          quotes.push({ text: item.text, category: item.category });
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        alert(`Successfully imported ${added} quotes.`);
      } else {
        alert('No valid quote objects found in the file.');
      }
    } catch (err) {
      console.error('Failed to import JSON:', err);
      alert('Failed to import. Ensure the file is valid JSON with an array of {text, category}.');
    } finally {
      // clear file input so the same file can be reselected later if desired
      event.target.value = '';
    }
  };

  reader.onerror = function (err) {
    console.error('File reading error:', err);
    alert('Error reading file.');
    event.target.value = '';
  };

  reader.readAsText(file);
}

// ===============================
// Event Listeners
// ===============================
newQuoteBtn.addEventListener("click", showRandomQuote);

// Create form when page loads
createAddQuoteForm();

// Load persisted quotes from localStorage (overwrites defaults if present)
loadQuotes();

// Restore last viewed quote if present in sessionStorage
restoreLastViewedQuote();


// ===============================
// Populate Categories (REQUIRED)
// ===============================
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const currentValue = select.value;

  // Clear existing options except "All"
  select.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  // Restore previously selected filter if available
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    select.value = savedFilter;
  } else {
    select.value = currentValue || "all";
  }
}

// ===============================
// Filter Quotes (REQUIRED)
// ===============================
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  const selectedCategory = select.value;

  // Persist selected filter
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(
      quote => quote.category === selectedCategory
    );
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <strong>— ${quote.category}</strong>
  `;
}


// ===============================
// Initialize Category Filter
// ===============================
populateCategories();

// Restore last selected category filter on load
const savedCategory = localStorage.getItem("selectedCategory");
if (savedCategory) {
  const select = document.getElementById("categoryFilter");
  if (select) {
    select.value = savedCategory;
    filterQuotes();
  }
}


// ===============================
// Server Simulation Config
// ===============================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 15000; // 15 seconds


// ===============================
// Fetch Quotes from Server
// ===============================
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulate quotes coming from server
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Server fetch failed:", error);
    return [];
  }
}

// ===============================
// Fetch Quotes From Server (REQUIRED)
// ===============================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Simulate server-side quotes
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
    return [];
  }
}


// ===============================
// Sync Local Data with Server
// ===============================
async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();
  if (serverQuotes.length === 0) return;

  let conflictResolved = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(
      localQuote => localQuote.text === serverQuote.text
    );

    if (!exists) {
      quotes.push(serverQuote);
      conflictResolved = true;
    }
  });

  if (conflictResolved) {
    saveQuotes();
    populateCategories();
    notifySync("Server updates synced. Conflicts resolved in favor of server.");
  }
}

// ===============================
// Sync Using fetchQuotesFromServer
// ===============================
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  if (!serverQuotes.length) return;

  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(
      localQuote => localQuote.text === serverQuote.text
    );

    // Server takes precedence
    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    notifySync("Quotes synced from server. Server data took precedence.");
  }
}


// ===============================
// Periodic Server Sync
// ===============================
setInterval(syncWithServer, SYNC_INTERVAL);

setInterval(syncWithServer, 15000);



// ===============================
// Sync Notification
// ===============================
function notifySync(message) {
  const status = document.getElementById("syncStatus");
  if (!status) return;

  status.textContent = message;
  status.style.color = "green";

  setTimeout(() => {
    status.textContent = "";
  }, 5000);
}

// ===============================
// Manual Sync (User Triggered)
// ===============================
function manualSync() {
  notifySync("Manual sync in progress...");
  syncWithServer();
}

// ===============================
// View Possible Conflicts
// ===============================
function checkConflicts(serverQuotes) {
  return serverQuotes.filter(serverQuote =>
    quotes.some(localQuote => localQuote.text === serverQuote.text)
  );
}

