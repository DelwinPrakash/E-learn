import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranscriptionService } from '../services/transcription.service';

@Component({
    selector: 'app-video-to-text',
    templateUrl: './video-to-text.component.html',
    styleUrls: ['./video-to-text.component.css']
})
export class VideoToTextComponent {
    videoUrl: string = '';
    selectedFile: File | null = null;
    transcription: string = '';
    isConverting: boolean = false;
    fileName: string = '';
    statusMessage: string = '';

    constructor(
        private router: Router,
        private transcriptionService: TranscriptionService
    ) { }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.fileName = file.name;
        }
    }

    convertVideo(): void {
        if (!this.selectedFile && !this.videoUrl) {
            alert('Please select a file or enter a video URL');
            return;
        }

        if (this.videoUrl && !this.isDirectMediaUrl(this.videoUrl)) {
            const confirmed = confirm('The URL provided does not look like a direct link to a media file (e.g., .mp4, .mp3). Hosting sites like YouTube or Google Drive URLs won\'t work directly. Do you still want to try?');
            if (!confirmed) return;
        }

        this.isConverting = true;
        this.transcription = '';
        this.statusMessage = 'Starting conversion...';

        const source = this.selectedFile || this.videoUrl;

        if (!this.transcriptionService.hasValidKey()) {
            this.statusMessage = 'Configuration needed: API Key missing.';
            this.isConverting = false;
            alert('Please provide your AssemblyAI API key in transcription.service.ts to enable this feature.');
            return;
        }

        this.transcriptionService.transcribe(source).subscribe({
            next: (transcript: any) => {
                if (transcript.status === 'error') {
                    this.statusMessage = 'Transcoding failed.';
                    this.isConverting = false;
                    let errorMsg = transcript.error;
                    if (errorMsg.includes('File type is text/html')) {
                        errorMsg = 'Failed to find audio. The URL might be a webpage instead of a direct video file.';
                    }
                    alert('Transcription failed: ' + errorMsg);
                } else {
                    this.transcription = transcript.text || 'No text found.';
                    this.statusMessage = 'Conversion complete!';
                    this.isConverting = false;
                }
            },
            error: (err: any) => {
                console.error('Transcription error:', err);
                this.statusMessage = 'Error occurred during transcription.';
                this.isConverting = false;
                if (err.message?.includes('YOUR_ASSEMBLYAI_API_KEY')) {
                    alert('Please provide a valid AssemblyAI API key in transcription.service.ts');
                } else {
                    alert('An error occurred. Check console for details.');
                }
            }
        });
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    private isDirectMediaUrl(url: string): boolean {
        const mediaExtensions = ['.mp4', '.mp3', '.wav', '.m4a', '.mov', '.avi', '.mkv', '.webm'];
        const lowerUrl = url.toLowerCase();
        return mediaExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?'));
    }

    clearAll(): void {
        this.videoUrl = '';
        this.selectedFile = null;
        this.fileName = '';
        this.transcription = '';
        this.statusMessage = '';
        this.isConverting = false;
    }
}
