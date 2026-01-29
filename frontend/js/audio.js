// Audio Recording
let mediaRecorder = null;
let audioChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      console.log('[Audio] Data available chunk:', e.data.size, 'bytes');
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.start();
    console.log('[Audio] Recording started');
    return true;
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('No recording in progress'));
      return;
    }

    mediaRecorder.onstop = () => {
      console.log('[Audio] Recording stopped. Total chunks:', audioChunks.length);

      // Calculate total size
      const totalSize = audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
      console.log('[Audio] Total audio size:', totalSize, 'bytes');

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      console.log('[Audio] Final blob size:', audioBlob.size, 'bytes');

      // Stop all tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      mediaRecorder = null;
      resolve(audioBlob);
    };

    mediaRecorder.onerror = (error) => {
      console.error('[Audio] MediaRecorder error:', error);
      reject(error);
    };

    mediaRecorder.stop();
  });
}

function isRecording() {
  return mediaRecorder !== null && mediaRecorder.state === 'recording';
}

// Audio Playback
function playAudio(url, audioElementId) {
  const audioElement = document.getElementById(audioElementId);
  if (audioElement) {
    audioElement.src = url;
    audioElement.style.display = 'block';
    audioElement.play();
  }
}

function getAudioBlobFromElement(audioElementId) {
  const audioElement = document.getElementById(audioElementId);
  if (audioElement && audioElement.src) {
    return fetch(audioElement.src)
      .then(res => res.blob())
      .then(blob => {
        // Convert webm to wav if needed
        return blob;
      });
  }
  return Promise.reject(new Error('No audio recorded'));
}
