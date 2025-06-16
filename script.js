import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://cassouhzovotgdhzssqg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhc3NvdWh6b3ZvdG..."; // shortened here for safety
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
