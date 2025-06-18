const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("status");

dropzone.addEventListener("click", () => fileInput.click());

["dragenter", "dragover"].forEach(event => {
  dropzone.addEventListener(event, e => {
    e.preventDefault();
    dropzone.classList.add("highlight");
  });
});
["dragleave", "drop"].forEach(event => {
  dropzone.addEventListener(event, e => {
    e.preventDefault();
    dropzone.classList.remove("highlight");
  });
});
dropzone.addEventListener("drop", e => {
  const files = [...e.dataTransfer.files];
  handleFiles(files);
});
fileInput.addEventListener("change", () => {
  const files = [...fileInput.files];
  handleFiles(files);
});

async function handleFiles(files) {
  for (const file of files) {
    if (file.type !== "application/pdf") continue;
    logStatus(`📄 Processing: ${file.name}`);
    const pdfData = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

      const formData = new FormData();
      formData.append("image", blob, `page-${i}.png`);

      logStatus(`→ Page ${i}: sending to backend...`);
      try {
        const res = await fetch("https://melissa-backend-gtqj.onrender.com/ocr", {
          method: "POST",
          body: formData
        });
        const result = await res.json();
        if (!res.ok) {
          logStatus(`❌ Page ${i}: ${result.error || "Unknown error"}`);
          continue;
        }

        const ids = result.found_ids || [];
        logStatus(`✅ Page ${i}: ${ids.length} IDs found`);
        for (const pallet_id of ids) {
          const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/NDAs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              "Prefer": "return=representation"
            },
            body: JSON.stringify({
              pallet_id,
              document_name: file.name,
              page_number: i
            })
          });
          if (!insertRes.ok) {
            const errText = await insertRes.text();
            logStatus(`❌ Supabase insert failed: ${errText}`);
          } else {
            logStatus(`🟢 Inserted ${pallet_id}`);
          }
        }
      } catch (err) {
        logStatus(`❌ Page ${i}: ${err.message}`);
      }
    }
    logStatus(`✅ Done with ${file.name}\n`);
  }
}

function logStatus(msg) {
  statusBox.textContent += msg + "\n";
}
