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

  for (const file of files) {
    const status = document.createElement("div");
    status.textContent = `⬆️ Uploading ${file.name}...`;
    uploadStatus.appendChild(status);

    const formData = new FormData();
    formData.append("file", file); // Match FastAPI's expected field name

    try {
      const response = await fetch(OCR_BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Server response:", result);
      status.textContent = `✅ Uploaded ${file.name}`;
    } catch (err) {
      console.error("Upload failed:", err);
      status.textContent = `❌ ${file.name} failed: ${err.message}`;
    }
  }
}
