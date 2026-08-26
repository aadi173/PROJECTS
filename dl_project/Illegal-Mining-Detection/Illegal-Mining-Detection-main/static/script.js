// static/script.js

let pieChartAnalyze = null;
let dashPie = null;
let dashBar = null;

// Navigation
document.getElementById("nav-analyze").addEventListener("click", (e) => {
  e.preventDefault();
  setActivePage("analyze");
});

document.getElementById("nav-dashboard").addEventListener("click", (e) => {
  e.preventDefault();
  setActivePage("dashboard");
  loadDashboard();
});

document.getElementById("nav-history").addEventListener("click", (e) => {
  e.preventDefault();
  setActivePage("history");
  loadHistory();
});

function setActivePage(page) {
  // Sidebar active
  document.querySelectorAll(".sidebar .nav-link").forEach(el => el.classList.remove("active"));
  document.getElementById(`nav-${page}`).classList.add("active");

  // Pages
  document.getElementById("page-analyze").style.display = page === "analyze" ? "block" : "none";
  document.getElementById("page-dashboard").style.display = page === "dashboard" ? "block" : "none";
  document.getElementById("page-history").style.display = page === "history" ? "block" : "none";
}

// Analyze button
document.getElementById("analyze-btn").addEventListener("click", () => {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (!file) {
    alert("Upload image first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  // Show loading, hide old result
  document.getElementById("result-loading").style.display = "block";
  document.getElementById("result-panel").style.display = "none";

  fetch("/predict", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    // Hide loading
    document.getElementById("result-loading").style.display = "none";
    document.getElementById("result-panel").style.display = "block";

    // CLASS
    document.getElementById("result-class-val").innerText = data.class;

    // BADGE
    const badge = document.getElementById("mining-badge");
    if (data.is_mining) {
      badge.innerText = "⚠ Mining Detected";
      badge.className = "mining-badge mining";
    } else {
      badge.innerText = "✓ Safe Area";
      badge.className = "mining-badge non-mining";
    }

    // CONFIDENCE & TIME
    document.getElementById("top-conf").innerText = (data.confidence * 100).toFixed(2) + "%";
    document.getElementById("inf-time").innerText = data.time + "s";
    document.getElementById("status-val").innerText = "Completed";

    // CONFIDENCE BARS
    const container = document.getElementById("confidence-bars");
    container.innerHTML = "";

    const classes = [
      'AnnualCrop','Forest','HerbaceousVegetation','Highway',
      'Industrial','Pasture','PermanentCrop','Residential',
      'River','SeaLake'
    ];

    data.scores.forEach((score, i) => {
      container.innerHTML += `
        <div class="confidence-row">
          <div class="confidence-label">${classes[i]}</div>
          <div class="confidence-bar-wrap">
            <div class="confidence-bar" style="width:${score*100}%; background:#3b82f6;"></div>
          </div>
          <div class="confidence-pct">${(score*100).toFixed(1)}%</div>
        </div>
      `;
    });

    // PIE CHART (Mining vs Non‑Mining area)
    const ctxPie = document.getElementById("pieChart").getContext("2d");
    if (pieChartAnalyze) pieChartAnalyze.destroy();

    pieChartAnalyze = new Chart(ctxPie, {
      type: "pie",
      data: {
        labels: ["Mining Area", "Non‑Mining Area"],
        datasets: [{
          data: [data.mining_pct, data.non_mining_pct],
          backgroundColor: ["#ef4444", "#22c55e"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  })
  .catch(err => {
    console.error("Full Error:", err);
    alert("Prediction failed — check backend");
    document.getElementById("result-loading").style.display = "none";
  });
});

// Load Dashboard
function loadDashboard() {
  fetch("/stats")
    .then(res => res.json())
    .then(stats => {
      document.getElementById("dash-total").innerText = stats.total;
      document.getElementById("dash-mining").innerText = stats.mining;
      document.getElementById("dash-safe").innerText = stats.safe;

      // Overall pie
      const miningPct = stats.total ? (stats.mining / stats.total) * 100 : 0;
      const nonMiningPct = 100 - miningPct;

      const ctxPie = document.getElementById("dash-pie").getContext("2d");
      if (dashPie) dashPie.destroy();

      dashPie = new Chart(ctxPie, {
        type: "pie",
        data: {
          labels: ["Mining Detected", "Safe Areas"],
          datasets: [{
            data: [miningPct, nonMiningPct],
            backgroundColor: ["#ef4444", "#22c55e"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });

      // Bar chart (recent predictions)
      const recent = stats.recent || [];
      const labels = recent.map((_, i) => "#" + (i + 1));
      const miningData = recent.map(r => (r.is_mining ? 100 : 0));

      const ctxBar = document.getElementById("dash-bar").getContext("2d");
      if (dashBar) dashBar.destroy();

      dashBar = new Chart(ctxBar, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Mining Detected",
            data: miningData,
            backgroundColor: "#ef4444"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100 }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    });
}

// Load History
function loadHistory() {
  fetch("/history")
    .then(res => res.json())
    .then(rows => {
      const tbody = document.getElementById("history-body");
      tbody.innerHTML = "";

      rows.forEach((r, idx) => {
        const tr = document.createElement("tr");
        const statusText = r.is_mining ? "Mining Detected" : "Safe";
        const statusClass = r.is_mining ? "text-danger" : "text-success";

        // Format time
        let t = r.time;
        try {
          const d = new Date(t);
          t = d.toLocaleString();
        } catch {}

        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${r.filename}</td>
          <td>${r.class}</td>
          <td>${(r.confidence * 100).toFixed(1)}%</td>
          <td class="${statusClass}">${statusText}</td>
          <td>${t}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

// Initial load: start on Analyze
window.onload = function () {
  setActivePage("analyze");
};