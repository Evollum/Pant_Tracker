const form = document.getElementById("pant-form");
const itemType = document.getElementById("item-type");
const quantityInput = document.getElementById("quantity");
const entryList = document.getElementById("entry-list");
const totalDisplay = document.getElementById("total");

let entries = JSON.parse(localStorage.getItem("pantEntries")) || [];
let chart;
let nonDonatedChart;

const pantValues = {
  small: 2,
  large: 3,
  tiny: 1, // New pant type
};

function updateUI() {
  console.log("updateUI called");
  console.log("Entries:", entries);

  const monthFilter = document.getElementById("month-filter");
  entryList.innerHTML = ""; // Donated entries list
  const nonDonatedList = document.getElementById("non-donated-list");
  nonDonatedList.innerHTML = ""; // Non-donated entries list

  let totalDonated = 0;
  let totalLotteryEarnings = 0;

  const selectedMonth = monthFilter.value; // format: "YYYY-MM"

  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  sortedEntries.forEach((entry, index) => {
    if (selectedMonth) {
      const entryMonth = entry.date?.slice(0, 7); // "YYYY-MM"
      if (entryMonth !== selectedMonth) return;
    }

    // Format the date to be more readable
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(entry.date));

    // Create the list item
    const li = document.createElement("li");
    li.innerText = `${formattedDate} - ${entry.quantity} × ${entry.typeLabel} = ${entry.total} NOK`;

    if (entry.isLottery) {
      li.innerText += ` (+ ${entry.lotteryAmount} NOK 🎉)`;
      totalLotteryEarnings += entry.lotteryAmount;
    }

    // Add Edit and Delete buttons
    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.style.marginLeft = "10px";
    editButton.addEventListener("click", () => editEntry(index));

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.style.marginLeft = "5px";
    deleteButton.addEventListener("click", () => deleteEntry(index));

    li.appendChild(editButton);
    li.appendChild(deleteButton);

    // Append to the correct list and update totals
    if (entry.isDonated) {
      totalDonated += entry.total;
      entryList.appendChild(li);
    } else {
      nonDonatedList.appendChild(li);
    }
  });

  // Update totals
  totalDisplay.innerText = totalDonated.toFixed(2);
  document.getElementById("lottery-total").innerText =
    totalLotteryEarnings.toFixed(2);
  ß;
  // Update the charts
  updateChart();
  updateNonDonatedChart();
}

function updateChart() {
  const donatedTotals = {};

  // Calculate totals for each month for donated entries
  entries.forEach((entry) => {
    if (entry.isDonated) {
      // Only include donated entries
      const month = entry.date?.slice(0, 7); // "YYYY-MM"
      if (!donatedTotals[month]) {
        donatedTotals[month] = 0;
      }
      donatedTotals[month] += entry.total;
    }
  });

  const labels = Object.keys(donatedTotals)
    .sort()
    .map((month) => {
      // Convert "YYYY-MM" to a readable month name
      const [year, monthNumber] = month.split("-");
      const date = new Date(year, monthNumber - 1); // Month is 0-indexed
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date);
    });

  const data = Object.keys(donatedTotals)
    .sort()
    .map((month) => donatedTotals[month]); // Totals for each month

  // Destroy the previous chart if it exists
  if (chart) chart.destroy();

  // Create a new chart
  const ctx = document.getElementById("pantChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar", // Bar chart for histogram
    data: {
      labels, // Months as labels
      datasets: [
        {
          label: "Donated Pant (NOK)",
          data, // Monthly totals
          backgroundColor: "#e63946", // Red color for bars
          borderColor: "#333", // Border color for bars
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#333", // Legend text color
            font: {
              size: 14,
              family: "Poppins", // Match the app's font
            },
          },
        },
        tooltip: {
          backgroundColor: "#fff", // Tooltip background
          titleColor: "#333", // Tooltip title color
          bodyColor: "#333", // Tooltip body color
          borderColor: "#ddd", // Tooltip border
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
            color: "#333",
            font: {
              size: 16,
              family: "Poppins",
            },
          },
          ticks: {
            color: "#555",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total (NOK)",
            color: "#333",
            font: {
              size: 16,
              family: "Poppins",
            },
          },
          ticks: {
            color: "#555",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
      },
    },
  });
}

function updateNonDonatedChart() {
  const nonDonatedTotals = {};

  // Calculate totals for each month for non-donated entries
  entries.forEach((entry) => {
    if (!entry.isDonated) {
      // Only include non-donated entries
      const month = entry.date?.slice(0, 7); // "YYYY-MM"
      if (!nonDonatedTotals[month]) {
        nonDonatedTotals[month] = 0;
      }
      nonDonatedTotals[month] += entry.total;
    }
  });

  const labels = Object.keys(nonDonatedTotals)
    .sort()
    .map((month) => {
      // Convert "YYYY-MM" to a readable month name
      const [year, monthNumber] = month.split("-");
      const date = new Date(year, monthNumber - 1); // Month is 0-indexed
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date);
    });

  const data = Object.keys(nonDonatedTotals)
    .sort()
    .map((month) => nonDonatedTotals[month]); // Totals for each month

  // Destroy the previous chart if it exists
  if (nonDonatedChart) nonDonatedChart.destroy();

  // Create a new chart
  const ctx = document.getElementById("nonDonatedChart").getContext("2d");
  nonDonatedChart = new Chart(ctx, {
    type: "bar", // Bar chart for histogram
    data: {
      labels, // Months as labels
      datasets: [
        {
          label: "Non-Donated Pant (NOK)",
          data, // Monthly totals
          backgroundColor: "#36A2EB", // Blue color for bars
          borderColor: "#333", // Border color for bars
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#333", // Legend text color
            font: {
              size: 14,
              family: "Poppins", // Match the app's font
            },
          },
        },
        tooltip: {
          backgroundColor: "#fff", // Tooltip background
          titleColor: "#333", // Tooltip title color
          bodyColor: "#333", // Tooltip body color
          borderColor: "#ddd", // Tooltip border
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
            color: "#333",
            font: {
              size: 16,
              family: "Poppins",
            },
          },
          ticks: {
            color: "#555",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total (NOK)",
            color: "#333",
            font: {
              size: 16,
              family: "Poppins",
            },
          },
          ticks: {
            color: "#555",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
      },
    },
  });
}

document.getElementById("month-filter").addEventListener("input", updateUI);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const quantityTiny =
    parseInt(document.getElementById("quantity-tiny").value) || 0;
  const quantitySmall =
    parseInt(document.getElementById("quantity-small").value) || 0;
  const quantityLarge =
    parseInt(document.getElementById("quantity-large").value) || 0;

  const lotteryInput = document.getElementById("lottery");
  const lotteryValue = parseFloat(lotteryInput.value) || 0;

  const dateInput = document.getElementById("entry-date");
  const date = dateInput.value || new Date().toISOString().split("T")[0]; // Use the specified date or today's date

  // Create entries for each type
  if (quantityTiny > 0) {
    entries.push({
      type: "tiny",
      typeLabel: "bottle",
      quantity: quantityTiny,
      total: quantityTiny * pantValues.tiny,
      date,
      isLottery: false,
      isDonated: true, // Mark as donated
    });
  }

  if (quantitySmall > 0) {
    entries.push({
      type: "small",
      typeLabel: "bottle",
      quantity: quantitySmall,
      total: quantitySmall * pantValues.small,
      date,
      isLottery: false,
      isDonated: true, // Mark as donated
    });
  }

  if (quantityLarge > 0) {
    entries.push({
      type: "large",
      typeLabel: "bottle",
      quantity: quantityLarge,
      total: quantityLarge * pantValues.large,
      date,
      isLottery: false,
      isDonated: true, // Mark as donated
    });
  }

  // Add lottery winnings as a separate entry if applicable
  if (lotteryValue > 0) {
    entries.push({
      type: "lottery",
      typeLabel: "lottery",
      quantity: 0,
      total: lotteryValue,
      date,
      isLottery: true,
      lotteryAmount: lotteryValue,
      isDonated: true, // Mark as donated
    });
  }

  // Save to localStorage
  localStorage.setItem("pantEntries", JSON.stringify(entries));

  // Clear the form
  document.getElementById("quantity-tiny").value = "0";
  document.getElementById("quantity-small").value = "0";
  document.getElementById("quantity-large").value = "0";
  lotteryInput.value = "";
  dateInput.value = "";

  // Update the UI
  updateUI();
});

const nonDonatedForm = document.getElementById("non-donated-form");

nonDonatedForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const quantityTiny =
    parseInt(document.getElementById("non-donated-tiny").value) || 0;
  const quantitySmall =
    parseInt(document.getElementById("non-donated-small").value) || 0;
  const quantityLarge =
    parseInt(document.getElementById("non-donated-large").value) || 0;

  const dateInput = document.getElementById("non-donated-date");
  const date = dateInput.value || new Date().toISOString().split("T")[0]; // Use the specified date or today's date

  // Create entries for each type
  if (quantityTiny > 0) {
    entries.push({
      type: "tiny",
      typeLabel: "bottle",
      quantity: quantityTiny,
      total: quantityTiny * pantValues.tiny,
      date,
      isLottery: false,
      isDonated: false, // Mark as non-donated
    });
  }

  if (quantitySmall > 0) {
    entries.push({
      type: "small",
      typeLabel: "bottle",
      quantity: quantitySmall,
      total: quantitySmall * pantValues.small,
      date,
      isLottery: false,
      isDonated: false, // Mark as non-donated
    });
  }

  if (quantityLarge > 0) {
    entries.push({
      type: "large",
      typeLabel: "bottle",
      quantity: quantityLarge,
      total: quantityLarge * pantValues.large,
      date,
      isLottery: false,
      isDonated: false, // Mark as non-donated
    });
  }

  // Save to localStorage
  localStorage.setItem("pantEntries", JSON.stringify(entries));

  // Clear the form
  document.getElementById("non-donated-tiny").value = "0";
  document.getElementById("non-donated-small").value = "0";
  document.getElementById("non-donated-large").value = "0";
  dateInput.value = "";

  // Update the UI
  updateUI();
});

function editEntry(index) {
  const entry = entries[index];

  // Populate the form with the entry's data
  itemType.value = entry.type;
  quantityInput.value = entry.quantity;
  document.getElementById("lottery").value = entry.isLottery
    ? entry.lotteryAmount
    : "";

  // Remove the entry from the list temporarily
  entries.splice(index, 1);
  localStorage.setItem("pantEntries", JSON.stringify(entries));

  // Update the UI
  updateUI();
}

function deleteEntry(index) {
  // Remove the entry from the list
  entries.splice(index, 1);
  localStorage.setItem("pantEntries", JSON.stringify(entries));

  // Update the UI
  updateUI();
}

updateUI(); // Run on page load
