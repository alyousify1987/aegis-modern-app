// OCR service with dynamic tesseract.js import
export async function ocrImageFromBlob(blob: Blob): Promise<string> {
  try{
    // Load on demand; the module is heavy
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker({ logger: () => {} });
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(blob);
    await worker.terminate();
    return text || '';
  } catch {
    // Fallback no-op OCR
    return '';
  }
}
