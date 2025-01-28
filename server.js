const express = require('express');
const { TempMail } = require('tempmail.lol');
const path = require('path');

const app = express();
const tempmail = new TempMail();

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/api/create-basic-inbox', async (req, res) => {
  try {
    const inbox = await tempmail.createInbox();
    res.status(201).json(inbox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/check-inbox/:token', async (req, res) => {
  try {
    const emails = await tempmail.checkInbox(req.params.token);
    if (!emails) return res.status(404).json({ error: 'Inbox not found or expired' });
    res.json({ emails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
