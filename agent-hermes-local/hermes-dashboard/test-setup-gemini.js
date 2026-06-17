const fetch = require('node-fetch');

async function testSetup() {
  console.log("=== TEST /setup ===");
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: 'mistral-small:24b',
        messages: [{ role: 'user', content: '/setup' }]
      })
    });
    const data = await res.json();
    console.log("Response Type:", data.type);
    console.log("Response Reply:", data.reply);
    console.log("Success:", data.type === 'setup' ? '✅' : '❌');
  } catch(e) {
    console.error("ERROR:", e);
  }
}

async function testGemini() {
  console.log("\n=== TEST GEMINI ===");
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: 'gemini-1.5-pro',
        messages: [{ role: 'user', content: 'Dis-moi bonjour en 3 mots.' }]
      })
    });
    const data = await res.json();
    console.log("Response:", data.reply);
    console.log("Success:", data.reply ? '✅' : '❌');
  } catch(e) {
    console.error("ERROR:", e);
  }
}

async function run() {
  await testSetup();
  await testGemini();
}

run();
