const KISSFLOW_WEBHOOK_URL =
  'https://refexgroup.kissflow.com/integration/2/AcCMptlq60zH/webhook/4e9yNyjAD6uxENJXAhNbtXzEGuOVQbDukBaeyWoG0kkqoeCkhIaxbK8FF4sWPWtcuQema2TcT-gLfVu3ot6g';

const queue = [];
let isProcessing = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugifyWebsiteName(name) {
  return String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'website';
}

function randomString() {
  return Math.random().toString(36).slice(2, 10);
}

async function postJson(url, payload) {
  // Prefer native fetch when available; fallback to node-fetch (transitive dep).
  const fetchFn =
    typeof fetch === 'function'
      ? fetch
      : (await import('node-fetch')).default;

  return fetchFn(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;

      const { websiteName, formName, formData } = item;
      const websiteSlug = slugifyWebsiteName(websiteName);
      const submissionId = `${websiteSlug}-${Date.now()}-${randomString()}`;
      const websiteAndForm = `${websiteName} - ${formName}`;

      const payload = {
        ...(formData || {}),
        submissionId,
        websiteName,
        formName,
        'Website and form': websiteAndForm,
        Website_and_form: websiteAndForm,
      };

      try {
        const res = await postJson(KISSFLOW_WEBHOOK_URL, payload);
        // Do not throw even on non-2xx. Log for visibility.
        if (!res || !('ok' in res) || res.ok !== true) {
          const status = res?.status;
          console.error('Kissflow webhook non-2xx response', { status, submissionId });
        }
      } catch (err) {
        console.error('Kissflow webhook failed', { message: err?.message, submissionId });
      }

      // Delay 3–4 seconds between requests
      await sleep(3500);
    }
  } finally {
    isProcessing = false;
  }
}

function sendToKissflowWebhook(websiteName, formName, formData) {
  try {
    queue.push({
      websiteName,
      formName,
      formData,
    });

    // Fire-and-forget worker; never block caller
    processQueue();
  } catch (err) {
    // Do not throw errors to the route
    console.error('Failed to enqueue Kissflow webhook', { message: err?.message });
  }
}

module.exports = {
  sendToKissflowWebhook,
  KISSFLOW_WEBHOOK_URL,
};

