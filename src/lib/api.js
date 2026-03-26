const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export async function callAI(prompt) {
  const token = localStorage.getItem('fitmind_token');
  let response;
  try {
    response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt }),
    });
  } catch {
    throw new Error('Cannot connect to server. Make sure the backend is running on port 5000.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API request failed');
  return data.response || 'No response received.';
}

export async function authRequest(mode, payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Cannot connect to server. Make sure the backend is running on port 5000.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Authentication failed');
  return data;
}

export function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { category: 'Underweight', color: '#60a5fa', rotation: -72, dashLength: 70 };
  if (bmi < 25) return { category: 'Normal Weight', color: '#22c55e', rotation: -18, dashLength: 141 };
  if (bmi < 30) return { category: 'Overweight', color: '#f59e0b', rotation: 36, dashLength: 211 };
  return { category: 'Obese', color: '#ef4444', rotation: 72, dashLength: 283 };
}

export function parseJSON(raw) {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    // Try to extract a JSON array first, then a JSON object
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    const objMatch = raw.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Could not parse JSON response');
  }
}
