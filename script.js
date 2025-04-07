const form = document.getElementById("pant-form");
const itemType = document.getElementById("item-type");
const quantityInput = document.getElementById("quantity");
const entryList = document.getElementById("entry-list");
const totalDisplay = document.getElementById("total");

let entries = JSON.parse(localStorage.getItem("pantEntries")) || [];

const pantValues = {
  small: 2,
  large: 3,
  tiny: 1, // New pant type
};

// Save entries to localStorage
function saveEntries() {
  localStorage.setItem("pantEntries", JSON.stringify(entries));
}

// Update the UI and save entries
function updateUI() {
  const entryList = document.getElementById("entry-list");
  entryList.innerHTML = ""; // Clear the list

  let totalDonated = 0;
  let totalLotteryEarnings = 0;

  entries.forEach((entry, index) => {
    // Create a list item for each entry
    const li = document.createElement("li");
    li.textContent = `${entry.date}: ${entry.quantity} bottles (${entry.typeLabel}) - ${entry.total} NOK`;
    entryList.appendChild(li);

    // Update totals
    totalDonated += entry.isDonated ? entry.total : 0;
    totalLotteryEarnings += entry.isLottery ? entry.lotteryAmount : 0;
  });

  // Update totals in the UI
  document.getElementById("total").textContent = totalDonated;
  document.getElementById("lottery-total").textContent = totalLotteryEarnings;

  // Save entries to localStorage
  saveEntries();
}

// Add a new entry
document.getElementById("pant-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const tiny = parseInt(document.getElementById("quantity-tiny").value) || 0;
  const small = parseInt(document.getElementById("quantity-small").value) || 0;
  const large = parseInt(document.getElementById("quantity-large").value) || 0;
  const date = document.getElementById("entry-date").value;
  const lottery = parseInt(document.getElementById("lottery").value) || 0;

  const total = tiny * 1 + small * 2 + large * 3;

  // Add the new entry to the entries array
  entries.push({
    date,
    quantity: tiny + small + large,
    typeLabel: "Donated",
    total,
    isLottery: lottery > 0,
    lotteryAmount: lottery,
    isDonated: true,
  });

  // Clear the form
  document.getElementById("pant-form").reset();

  // Update the UI
  updateUI();
});

// Check and apply dark mode state from localStorage
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
}

// Toggle dark mode
document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Save the dark mode state
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
});

// Load the UI on page load
updateUI();
