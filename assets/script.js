const OCR_BACKEND_URL = "https://melissa-backend-gtqj.onrender.com/upload";

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
});

async function handleFiles(files) {
  uploadStatus.innerHTML = "";

  if (!files.length) return;

  const status = document.createElement("div");
  status.textContent = `⬆️ Uploading ${files.length} file(s)...`;
  uploadStatus.appendChild(status);

  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file); // ✅ "files" matches FastAPI's expected input
  }

  try {
    const response = await fetch(OCR_BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response from backend:", result);

    status.textContent = `✅ Upload complete: ${files.length} file(s).`;
  } catch (err) {
    console.error("Upload failed:", err);
    status.textContent = `❌ Upload failed: ${err.message}`;
  }
}
