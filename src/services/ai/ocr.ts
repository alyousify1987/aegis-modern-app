// Enhanced OCR service with Tesseract.js Web Worker support
export interface OcrResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

let tesseractWorker: any = null;

export async function ocrImageFromBlob(blob: Blob): Promise<string> {
  try {
    const result = await performOCR(blob);
    return result.text;
  } catch (error) {
    console.error('OCR failed:', error);
    return '';
  }
}

export async function performOCR(imageSource: string | File | Blob | ImageData): Promise<OcrResult> {
  try {
    // Load on demand; the module is heavy
    const { createWorker } = await import('tesseract.js');
    
    if (!tesseractWorker) {
      tesseractWorker = await createWorker('eng', 1, {
        logger: () => {}, // Disable logging for production
      });
    }
    
    const { data } = await tesseractWorker.recognize(imageSource);
    
    return {
      text: data.text || '',
      confidence: data.confidence || 0,
      words: data.words?.map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox
      })) || [],
      blocks: data.blocks?.map((block: any) => ({
        text: block.text,
        confidence: block.confidence,
        bbox: block.bbox
      })) || []
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    // Fallback result
    return {
      text: '',
      confidence: 0,
      words: [],
      blocks: []
    };
  }
}

export async function extractDocumentText(file: File): Promise<{ text: string; confidence: number }> {
  try {
    const result = await performOCR(file);
    return {
      text: result.text,
      confidence: result.confidence
    };
  } catch (error) {
    console.error('Document text extraction failed:', error);
    return {
      text: '',
      confidence: 0
    };
  }
}

export async function analyzeHandwriting(imageSource: string | File | Blob | ImageData): Promise<{
  similarityScore: number;
  isConsistent: boolean;
  analysisNotes: string[];
}> {
  try {
    const result = await performOCR(imageSource);
    
    // Simple heuristic analysis for handwriting consistency
    const words = result.words.filter(word => word.confidence > 50);
    
    if (words.length < 5) {
      return {
        similarityScore: 0,
        isConsistent: false,
        analysisNotes: ['Insufficient text for handwriting analysis']
      };
    }
    
    // Calculate confidence variance as a proxy for handwriting consistency
    const confidences = words.map(word => word.confidence);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    const variance = confidences.reduce((sum, conf) => sum + Math.pow(conf - avgConfidence, 2), 0) / confidences.length;
    
    const similarityScore = Math.max(0, 100 - Math.sqrt(variance));
    const isConsistent = variance < 400; // Threshold for consistency
    
    const analysisNotes: string[] = [];
    if (variance > 800) {
      analysisNotes.push('High variance in text recognition confidence detected');
    }
    if (avgConfidence < 70) {
      analysisNotes.push('Low overall recognition confidence may indicate poor image quality');
    }
    if (isConsistent) {
      analysisNotes.push('Handwriting appears consistent across the document');
    } else {
      analysisNotes.push('Potential inconsistencies detected in handwriting patterns');
    }
    
    return {
      similarityScore,
      isConsistent,
      analysisNotes
    };
  } catch (error) {
    console.error('Handwriting analysis failed:', error);
    return {
      similarityScore: 0,
      isConsistent: false,
      analysisNotes: ['Handwriting analysis failed due to technical error']
    };
  }
}

export async function shutdownOCR(): Promise<void> {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}
