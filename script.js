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
      // Remove the entry from the array
      entries.splice(index, 1);

      // Update the charts
      updateChartData();

      // Save the updated entries and chart data
      saveEntries();
      saveChartData();

      // Update the UI
      updateUI();
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

  // Recalculate chart data from entries
  entries.forEach((entry) => {
    const month = new Date(entry.date).toLocaleString("default", {
      month: "long",
    });

    if (entry.isDonated) {
      if (!donationLabels.includes(month)) {
        donationLabels.push(month);
        donationData.push(entry.total);
      } else {
        const index = donationLabels.indexOf(month);
        donationData[index] += entry.total;
      }
    } else {
      if (!nonDonationLabels.includes(month)) {
        nonDonationLabels.push(month);
        nonDonationData.push(entry.total);
      } else {
        const index = nonDonationLabels.indexOf(month);
        nonDonationData[index] += entry.total;
      }
    }
  });
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
