// DOM Helpers
function populateDropdown(selectId, options, placeholder = 'Select an option') {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = `<option value="">${placeholder}</option>`;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.id;
    option.textContent = opt.name;
    select.appendChild(option);
  });
}

function clearDropdown(selectId, placeholder = 'Select an option') {
  const select = document.getElementById(selectId);
  if (select) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
  }
}

function setDropdownValue(selectId, value) {
  const select = document.getElementById(selectId);
  if (select) {
    select.value = value;
    // Trigger change event if there are listeners
    select.dispatchEvent(new Event('change'));
  }
}

function showStatus(elementId, message, type = 'info') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `status show ${type}`;
  }
}

function hideStatus(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.className = 'status';
  }
}

function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function setHTML(elementId, html) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = html;
  }
}

function setButtonLoading(btnId, loading, originalText = '') {
  const btn = document.getElementById(btnId);
  if (btn) {
    if (loading) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Loading...';
      btn.disabled = true;
    } else {
      btn.textContent = originalText || btn.dataset.originalText || 'Submit';
      btn.disabled = false;
    }
  }
}

// Tab Navigation
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Deactivate all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const tab = document.getElementById(`${tabName}-tab`);
  if (tab) {
    tab.classList.add('active');
  }

  // Activate button
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (btn) {
    btn.classList.add('active');
  }
}

// Chat UI Helpers
function addUserMessage(text) {
  const chatHistory = document.getElementById('chat-history');
  if (!chatHistory) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message user';
  messageDiv.innerHTML = `
    <div class="message-content">${escapeHtml(text)}</div>
    <div class="timestamp">${formatTime(new Date())}</div>
  `;
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function addAgentMessage(text, audioUrl) {
  const chatHistory = document.getElementById('chat-history');
  if (!chatHistory) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message agent';

  let audioHtml = '';
  if (audioUrl) {
    audioHtml = `<audio controls src="${audioUrl}"></audio>`;
  }

  messageDiv.innerHTML = `
    <div class="message-content">${escapeHtml(text)}</div>
    ${audioHtml}
    <div class="timestamp">${formatTime(new Date())}</div>
  `;
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Auto-play audio if available
  if (audioUrl) {
    const audio = messageDiv.querySelector('audio');
    if (audio) {
      audio.play().catch(err => console.log('Auto-play prevented:', err));
    }
  }
}

function clearChatHistory() {
  const chatHistory = document.getElementById('chat-history');
  if (chatHistory) {
    chatHistory.innerHTML = '';
  }
}

function setChatStatus(status, message) {
  const statusElement = document.getElementById('chat-status');
  if (!statusElement) return;

  statusElement.className = 'status-indicator';

  switch(status) {
    case 'ready':
      statusElement.classList.add('ready');
      statusElement.textContent = message || 'Ready';
      break;
    case 'listening':
      statusElement.classList.add('listening');
      statusElement.textContent = message || 'Listening...';
      break;
    case 'processing':
      statusElement.classList.add('processing');
      statusElement.textContent = message || 'Processing...';
      break;
    case 'error':
      statusElement.classList.add('error');
      statusElement.textContent = message || 'Error';
      break;
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
