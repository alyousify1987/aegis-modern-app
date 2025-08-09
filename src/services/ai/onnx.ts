// ONNX runtime wrapper for simple local inference
export type OnnxSession = {
  run: (feeds: Record<string, any>) => Promise<Record<string, any>>
};

let ort: any = null;

export async function initOnnx(): Promise<void> {
  if (ort) return;
  try {
    ort = await import('onnxruntime-web');
  } catch {
    ort = null;
  }
}

export async function createSession(modelUrl: string): Promise<OnnxSession | null> {
  await initOnnx();
  if (!ort) return null;
  const session = await ort.InferenceSession.create(modelUrl, { executionProviders: ['wasm'] });
  return {
    async run(feeds: Record<string, any>){
      const results = await session.run(feeds);
      return results as any;
    }
  };
}
