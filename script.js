
const SUPABASE_URL = "https://cassouhzovotgdhzssqg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhc3NvdWh6b3ZvdGdkaHpzc3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTg5MjYsImV4cCI6MjA2NDY5NDkyNn0.dNg51Yn9aplsyAP9kvsEQOTHWb64edsAk5OqiynEZlk"; // Replace this before deploying
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const OCR_BACKEND_URL = "https://melissa.onrender.com/upload"; // Replace with your actual Render endpoint

// Upload logic
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(files) {
  uploadStatus.innerHTML = "";
  Array.from(files).forEach(async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);
    const status = document.createElement("div");
    status.textContent = `Uploading ${file.name}...`;
    uploadStatus.appendChild(status);

    try {
      const response = await fetch(OCR_BACKEND_URL, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        status.textContent = `✅ ${file.name} uploaded and processed.`;
      } else {
        status.textContent = `❌ ${file.name} failed: ${result.error || "Unknown error"}`;
      }
    } catch (err) {
      status.textContent = `❌ ${file.name} failed: ${err.message}`;
    }
  });
}

// Search logic
async function searchPallets() {
  const input = document.getElementById("palletInput").value;
  const palletIds = input.split(/\s+/).filter(id => id.length === 18);

  const { data, error } = await supabase
    .from("NDAs")
    .select("*")
    .in("pallet_id", palletIds);

  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";
  if (error) {
    alert("Error fetching data: " + error.message);
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.pallet_id}</td>
      <td>${row.document_name}</td>
      <td>${row.page_number}</td>
    `;
    tbody.appendChild(tr);
  });
}
