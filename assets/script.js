
const SUPABASE_URL = "https://cassouhzovotgdhzssqg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhc3NvdWh6b3ZvdGdkaHpzc3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTg5MjYsImV4cCI6MjA2NDY5NDkyNn0.dNg51Yn9aplsyAP9kvsEQOTHWb64edsAk5OqiynEZlk";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const OCR_BACKEND_URL = "https://melissa.onrender.com/upload";

const uploadStatus = document.getElementById("uploadStatus");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

async function handleFiles(files) {
  uploadStatus.innerHTML = "";
  for (const file of files) {
    const formData = new FormData();
    formData.append("pdf", file);

    const status = document.createElement("div");
    status.textContent = `⬆️ Uploading ${file.name}...`;
    uploadStatus.appendChild(status);

    try {
      await fetch(OCR_BACKEND_URL, {
        method: "POST",
        body: formData,
      });
      status.textContent = `✅ ${file.name} uploaded.`;
    } catch (err) {
      console.error("Upload fetch failed:", err);
      status.textContent = `❌ ${file.name} failed to upload.`;
    }
  }
}

async function searchPallets() {
  const input = document.getElementById("palletInput").value;
  const palletIds = input.split(/\s+/).filter(id => /^\d{18}$/.test(id));

  if (palletIds.length === 0) {
    alert("Please enter at least one valid 18-digit pallet ID.");
    return;
  }

  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "<tr><td colspan='3'>Searching...</td></tr>";

  try {
    const { data, error } = await supabase
      .from("NDAs")
      .select("*")
      .in("pallet_id", palletIds);

    tbody.innerHTML = "";

    if (error) {
      console.error("Supabase error:", error);
      alert("Error fetching data.");
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3'>No matches found.</td></tr>";
      return;
    }

    data.sort((a, b) => a.pallet_id.localeCompare(b.pallet_id));

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.pallet_id}</td>
        <td>${row.document_name}</td>
        <td>${row.page_number}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Search failed.");
  }
}

document.getElementById("searchButton").addEventListener("click", searchPallets);
