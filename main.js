const SUPABASE_URL = "https://cassouhzovotgdhzssqg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhc3NvdWh6b3ZvdGdkaHpzc3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTg5MjYsImV4cCI6MjA2NDY5NDkyNn0.dNg51Yn9aplsyAP9kvsEQOTHWb64edsAk5OqiynEZlk";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dropzone = document.getElementById("dropzone");
const status = document.getElementById("status");

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("highlight");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("highlight");
});

dropzone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropzone.classList.remove("highlight");
  const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");

  for (const file of files) {
    status.textContent = \`Processing \${file.name}...\`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const { data: { text } } = await Tesseract.recognize(canvas, "eng");

      const ids = text.match(/\b\d{18}\b/g) || [];
      for (const id of ids) {
        const { error } = await supabase.from("NDAs").insert([{
          pallet_id: id,
          document_name: file.name,
          page_number: pageNum
        }]);
        if (error) console.error("Insert error:", error);
      }
    }
    status.textContent = \`Done processing \${file.name}.\`;
  }
});
