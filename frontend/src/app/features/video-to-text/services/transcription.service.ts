import { Injectable } from '@angular/core';
import { AssemblyAI } from 'assemblyai';
import { from, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TranscriptionService {
    private client: AssemblyAI;
    private apiKey: string = '5f3318faf59149f198b821aeed23dda7';

    constructor() {
        if (this.apiKey === 'YOUR_ASSEMBLYAI_API_KEY') {
            console.warn('AssemblyAI API Key is missing. Please provide it in transcription.service.ts');
        }

        this.client = new AssemblyAI({
            apiKey: this.apiKey
        });
    }

    hasValidKey(): boolean {
        return this.apiKey !== 'YOUR_ASSEMBLYAI_API_KEY' && this.apiKey.trim() !== '';
    }

    transcribe(file: File | string): Observable<any> {
        if (typeof file === 'string') {
            return from(this.client.transcripts.transcribe({ audio: file }));
        } else {
            return from(this.client.transcripts.transcribe({ audio: file }));
        }
    }

    // Helper to check progress if needed (the SDK handles simple cases)
    getTranscript(transcriptId: string): Observable<any> {
        return from(this.client.transcripts.get(transcriptId));
    }
}
