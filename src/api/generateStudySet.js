import { isValidStudySet } from '../data/studySet';

const REQUEST_TIMEOUT_MS = 200000; // the server allows up to ~3 minutes (two attempts)

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.slice(result.indexOf(',') + 1)); // drop the "data:...;base64," prefix
    };
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Ask the server to create a study set. Throws an Error with a message that is
 * safe to show to the student.
 */
export async function generateStudySet({ text, title, files }) {
  let encodedFiles;
  try {
    encodedFiles = await Promise.all(
      files.map(async (file) => ({ name: file.name, data: await readAsBase64(file) }))
    );
  } catch {
    throw new Error('One of your files could not be read. Please add it again.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, files: encodedFiles }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('This is taking too long. Please try again with shorter notes or a smaller file.');
    }
    throw new Error('Could not reach the server. Check your connection and that the server is running.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* not JSON, handled below */
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong while creating your study set. Please try again.');
  }
  if (!isValidStudySet(data)) {
    throw new Error('The AI returned an incomplete study set. Please try again.');
  }
  return data;
}
