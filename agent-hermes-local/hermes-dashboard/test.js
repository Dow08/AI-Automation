const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: 'mistral-small:24b',
        messages: [{ role: 'user', content: 'Bonjour ! Qui es-tu et que peux-tu faire ?' }]
      })
    });
    const data = await res.json();
    console.log("RESPONSE:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
