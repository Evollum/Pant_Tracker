import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://pant-tracker-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("pant-form");
const itemType = document.getElementById("item-type");
const quantityInput = document.getElementById("quantity");
const entryList = document.getElementById("entry-list");
const totalDisplay = document.getElementById("total");

// Initialize entries and chart data from localStorage or as empty arrays
let entries = [];
let donationChartInstance = null;
let nonDonationChartInstance = null;

function fetchEntries() {
  const entriesRef = ref(db, "entries");
  const chartDataRef = ref(db, "chartData");

  // Fetch entries
  onValue(entriesRef, (snapshot) => {
    const data = snapshot.val();
    entries = data ? Object.values(data) : [];
    updateUI();
  });

  // Fetch chart data
  onValue(chartDataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      donationLabels = data.donationLabels || [];
      donationData = data.donationData || [];
      nonDonationLabels = data.nonDonationLabels || [];
      nonDonationData = data.nonDonationData || [];
      updateDonationChart();
      updateNonDonationChart();
    }
  });
}

fetchEntries();

let donationLabels = JSON.parse(localStorage.getItem("donationLabels")) || [];
let donationData = JSON.parse(localStorage.getItem("donationData")) || [];
let nonDonationLabels =
  JSON.parse(localStorage.getItem("nonDonationLabels")) || [];
let nonDonationData = JSON.parse(localStorage.getItem("nonDonationData")) || [];

const pantValues = {
  small: 2,
  large: 3,
  tiny: 1, // New pant type
};

// Save entries to localStorage
function saveEntries() {
  localStorage.setItem("pantEntries", JSON.stringify(entries));
}

// Save chart data to Firebase
function saveChartData() {
  const chartDataRef = ref(db, "chartData");
  set(chartDataRef, {
    donationLabels,
    donationData,
    nonDonationLabels,
    nonDonationData,
  });
}

// Update the UI and save entries
function updateUI() {
  const entryList = document.getElementById("entry-list");
  entryList.innerHTML = ""; // Clear the list

  let totalDonated = 0;
  let totalNonDonated = 0;
  let totalLotteryEarnings = 0;

  entries.forEach((entry, index) => {
    // Create a list item for each entry
    const li = document.createElement("li");
    li.textContent = `${entry.date}: ${entry.quantity} bottles (${entry.typeLabel}) - ${entry.total} NOK`;

    // Create a delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete");

    // Add delete functionality
    deleteButton.addEventListener("click", () => {
      const entryId = entry.id; // Ensure each entry has a unique ID from Firebase
      deleteEntry(entryId);
      updateChartData();
      updateDonationChart();
      updateNonDonationChart();
    });

    // Append the delete button to the list item
    li.appendChild(deleteButton);

    // Append the list item to the entry list
    entryList.appendChild(li);

    // Update totals
    if (entry.isDonated) {
      totalDonated += entry.total;
    } else {
      totalNonDonated += entry.total;
    }
    totalLotteryEarnings += entry.isLottery ? entry.lotteryAmount : 0;
  });

  // Update totals in the summary section
  document.getElementById("total-summary").textContent = totalDonated;
  document.getElementById("non-donated-summary").textContent = totalNonDonated;
  document.getElementById("lottery-summary").textContent = totalLotteryEarnings;

  // Update the grand total (donated + non-donated)
  const grandTotal = totalDonated + totalNonDonated;
  document.getElementById("grand-total").textContent = grandTotal;

  // Update the total in the donated and non-donated sections
  document.getElementById("donated-total").textContent = totalDonated;
  document.getElementById("non-donated-total").textContent = totalNonDonated;

  // Save entries to localStorage
  saveEntries();
}

// Update chart data after deletion
function updateChartData() {
  // Reset chart data
  donationLabels = [];
  donationData = [];
  nonDonationLabels = [];
  nonDonationData = [];

  // Create a Set to store all unique months
  const allMonths = new Set();

  // Collect all months from entries
  entries.forEach((entry) => {
    const month = new Date(entry.date).toLocaleString("default", {
      month: "long",
    });
    allMonths.add(month);
  });

  // Sort months in chronological order
  const sortedMonths = Array.from(allMonths).sort(
    (a, b) =>
      new Date(`1 ${a} 2023`).getMonth() - new Date(`1 ${b} 2023`).getMonth()
  );

  // Initialize donation and non-donation data for all months
  sortedMonths.forEach((month) => {
    donationLabels.push(month);
    donationData.push(0); // Default to 0
    nonDonationLabels.push(month);
    nonDonationData.push(0); // Default to 0
  });

  // Populate data for each month
  entries.forEach((entry) => {
    const month = new Date(entry.date).toLocaleString("default", {
      month: "long",
    });

    if (entry.isDonated) {
      const index = donationLabels.indexOf(month);
      donationData[index] += entry.total;
    } else {
      const index = nonDonationLabels.indexOf(month);
      nonDonationData[index] += entry.total;
    }
  });

  // Save chart data to Firebase
  saveChartData();
}

// Update the donation chart
function updateDonationChart() {
  const ctxPant = document.getElementById("pantChart").getContext("2d");

  // Destroy the existing chart instance if it exists
  if (donationChartInstance) {
    donationChartInstance.destroy();
  }

  // Create a new chart instance
  donationChartInstance = new Chart(ctxPant, {
    type: "bar",
    data: {
      labels: donationLabels,
      datasets: [
        {
          label: "Donations (NOK)",
          data: donationData,
          backgroundColor: "rgba(255, 111, 97, 0.6)", // Coral red
          borderColor: "rgba(255, 111, 97, 1)",
          borderWidth: 1,
          borderRadius: 5, // Rounded bars
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            font: {
              family: "Poppins",
              size: 14,
            },
            color: "#333333",
          },
        },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#333",
          bodyColor: "#333",
          borderColor: "#ccc",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: "Poppins",
            },
            color: "#333333",
          },
        },
        y: {
          grid: {
            color: "#eee",
          },
          ticks: {
            font: {
              family: "Poppins",
            },
            color: "#333333",
          },
        },
      },
    },
  });
}

// Update the non-donation chart
function updateNonDonationChart() {
  const ctxNonDonated = document
    .getElementById("nonDonatedChart")
    .getContext("2d");

  // Destroy the existing chart instance if it exists
  if (nonDonationChartInstance) {
    nonDonationChartInstance.destroy();
  }

  // Create a new chart instance
  nonDonationChartInstance = new Chart(ctxNonDonated, {
    type: "bar",
    data: {
      labels: nonDonationLabels,
      datasets: [
        {
          label: "Non-Donated Pant (NOK)",
          data: nonDonationData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
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

  const newEntry = {
    date,
    quantity: tiny + small + large,
    typeLabel: "Donated",
    total,
    isLottery: lottery > 0,
    lotteryAmount: lottery,
    isDonated: true,
  };

  saveEntry(newEntry);
  updateChartData();
  updateDonationChart();
  updateNonDonationChart();

  // Clear the form
  document.getElementById("pant-form").reset();
});

// Add a new non-donated entry
document.getElementById("non-donated-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const tiny = parseInt(document.getElementById("non-donated-tiny").value) || 0;
  const small =
    parseInt(document.getElementById("non-donated-small").value) || 0;
  const large =
    parseInt(document.getElementById("non-donated-large").value) || 0;
  const date = document.getElementById("non-donated-date").value;

  const total = tiny * 1 + small * 2 + large * 3;

  // Update non-donation chart data
  const month = new Date(date).toLocaleString("default", { month: "long" });
  if (!nonDonationLabels.includes(month)) {
    nonDonationLabels.push(month);
    nonDonationData.push(total);
  } else {
    const index = nonDonationLabels.indexOf(month);
    nonDonationData[index] += total;
  }

  // Save data to localStorage
  saveChartData();

  // Update the charts
  updateNonDonationChart();
});

// Save entry to the database
async function saveEntry(entry) {
  const entriesRef = ref(db, "entries");
  const newEntryRef = push(entriesRef);
  await set(newEntryRef, entry);
}

// Delete entry from the database
async function deleteEntry(id) {
  const entryRef = ref(db, `entries/${id}`);
  await remove(entryRef);
}

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

// Load the UI and charts on page load
updateUI();
updateChartData();
updateDonationChart();
updateNonDonationChart();
