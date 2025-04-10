const form = document.getElementById("pant-form");
const itemType = document.getElementById("item-type");
const quantityInput = document.getElementById("quantity");
const entryList = document.getElementById("entry-list");
const totalDisplay = document.getElementById("total");

// Initialize entries and chart data from localStorage or as empty arrays
let entries = JSON.parse(localStorage.getItem("pantEntries")) || [];
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

// Save chart data to localStorage
function saveChartData() {
  localStorage.setItem("donationLabels", JSON.stringify(donationLabels));
  localStorage.setItem("donationData", JSON.stringify(donationData));
  localStorage.setItem("nonDonationLabels", JSON.stringify(nonDonationLabels));
  localStorage.setItem("nonDonationData", JSON.stringify(nonDonationData));
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

// Update the donation chart
function updateDonationChart() {
  const ctxPant = document.getElementById("pantChart").getContext("2d");
  new Chart(ctxPant, {
    type: "bar",
    data: {
      labels: donationLabels,
      datasets: [
        {
          label: "Donations (NOK)",
          data: donationData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
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

// Update the non-donation chart
function updateNonDonationChart() {
  const ctxNonDonated = document
    .getElementById("nonDonatedChart")
    .getContext("2d");
  new Chart(ctxNonDonated, {
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

  // Update donation chart data
  const month = new Date(date).toLocaleString("default", { month: "long" });
  if (!donationLabels.includes(month)) {
    donationLabels.push(month);
    donationData.push(total);
  } else {
    const index = donationLabels.indexOf(month);
    donationData[index] += total;
  }

  // Save data to localStorage
  saveEntries();
  saveChartData();

  // Update the UI and charts
  updateUI();
  updateDonationChart();
  updateNonDonationChart();
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
updateDonationChart();
updateNonDonationChart();
