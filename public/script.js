let currentToken = '', currentEmail = '';

function setLoading(isLoading) {
    const elements = ['createInboxBtn', 'checkInboxBtn', 'emailInput', 'copyEmailBtn'];
    elements.forEach(id => document.getElementById(id).disabled = isLoading);
}

async function fetchData(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
    return res.json();
}

async function createBasicInbox() {
    try {
        setLoading(true);
        const { address, token } = await fetchData('/api/create-basic-inbox');
        currentEmail = address;
        currentToken = token;

        document.getElementById('emailInput').value = address;
        document.getElementById('checkInboxBtn').disabled = false;
        document.getElementById('copyEmailBtn').disabled = false;
    } catch (error) {
        showToast(error.message);
    } finally {
        setLoading(false);
    }
}

async function checkInbox() {
    try {
        setLoading(true);
        if (!currentToken) throw new Error('Please create an inbox first');

        const data = await fetchData(`/api/check-inbox/${currentToken}`);
        data.emails.length ? displayEmails(data.emails) : showToast('No emails found');
    } catch (error) {
        showToast(error.message);
    } finally {
        setLoading(false);
    }
}

function displayEmails(emails) {
    const container = document.getElementById('emails-container');
    container.innerHTML = emails.map((email, i) => `
    <div>
        <p class="text-xs"><strong>From :</strong> ${email.from}</p>
        <p class="text-xs"><strong>To :</strong> ${email.to || 'Not specified'}</p>
        <p class="text-xs"><strong>Subject :</strong> ${email.subject}</p>
        <p class="text-xs"><strong>Date :</strong> ${new Date(email.date * 1000).toLocaleString()}</p>
        <div class="mt-3 space-x-2">
            ${['text', 'html', 'raw'].map(type => `<button onclick="showContent('${type}', ${i})" class="btn btn-sm bg-base-300 border-2 border-black rounded-none text-xs">${type === 'text' ? 'Plain Text' : type === 'html' ? 'HTML' : 'Raw Data'}</button>`).join('')}
        </div>
        ${['text', 'html', 'raw'].map(type => `
            <div id="${type}-content-${i}" class="mt-3 p-3 bg-gray-50 rounded ${type === 'text' ? '' : 'hidden'}">
                ${type === 'text' ? `<pre class="whitespace-pre-wrap">${email.body || 'No plaintext content'}</pre>` : type === 'html' ? email.html || 'No HTML content' : `<pre class="whitespace-pre-wrap">${JSON.stringify(email, null, 2)}</pre>`}
            </div>
        `).join('')}
    </div>
`).join('');

    const inboxContainer = document.getElementById('emails-container-wrapper');
    inboxContainer.classList.remove('hidden');
}

function showContent(type, i) {
    ['text', 'html', 'raw'].forEach(t => {
        const element = document.getElementById(`${t}-content-${i}`);
        element.classList.toggle('hidden', t !== type);
    });
}

function copyEmail() {
    if (currentEmail) {
        navigator.clipboard.writeText(currentEmail)
            .then(() => {
                const copyBtn = document.getElementById('copyEmailBtn');
                copyBtn.innerHTML = '<i class="bi bi-check"></i>';
                setTimeout(() => copyBtn.innerHTML = '<i class="bi bi-copy"></i>', 3000);
            })
            .catch(() => showToast('Failed to copy email'));
    }
}

function showToast(message) {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast');

    const toast = document.createElement('div');
    toast.classList.add('alert', 'bg-base-100', 'uppercase', 'transition-opacity', 'opacity-100', 'border-2', 'border-black', 'rounded-none');
    toast.innerHTML = `<span>${message}</span>`;

    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        toast.classList.remove('opacity-100');
    }, 2500);

    toast.addEventListener('transitionend', () => {
        toastContainer.remove();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createInboxBtn').addEventListener('click', createBasicInbox);
    document.getElementById('checkInboxBtn').addEventListener('click', checkInbox);
    document.getElementById('copyEmailBtn').addEventListener('click', copyEmail);
});