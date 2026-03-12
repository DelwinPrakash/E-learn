import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { AuthService } from 'src/app/core/auth/auth.service';

export interface Topic {
    id: string;
    name: string;
    unit?: string;
    estimatedHours: number;
    completed: boolean;
    completionDate?: Date;
}

export interface DailyPlan {
    date: Date;
    topics: Topic[];
    isRevision: boolean;
    totalHours: number;
}

export interface SchedulerData {
    examDate: Date;
    dailyStudyHours: number;
    syllabus: Topic[];
    startDate: Date;
}

@Injectable({
    providedIn: 'root'
})
export class MicrolearningSchedulerService {
    private scheduleSubject = new BehaviorSubject<DailyPlan[]>([]);
    public schedule$: Observable<DailyPlan[]> = this.scheduleSubject.asObservable();

    private isProcessingSubject = new BehaviorSubject<boolean>(false);
    public isProcessing$: Observable<boolean> = this.isProcessingSubject.asObservable();

    constructor(private http: HttpClient, private authService: AuthService) { }

    /**
     * Uploads syllabus PDF and parameters to the backend for processing.
     */
    uploadSyllabus(file: File, examDate: Date, dailyStudyHours: number): Observable<DailyPlan[]> {
        this.isProcessingSubject.next(true);

        const formData = new FormData();
        formData.append('syllabus', file);
        formData.append('examDate', examDate.toISOString());
        formData.append('dailyStudyHours', dailyStudyHours.toString());

        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.post<DailyPlan[]>(`${environment.BACKEND_BASE_URL}/api/scheduler/generate`, formData, { headers }).pipe(
            tap(schedule => {
                this.scheduleSubject.next(schedule);
                this.isProcessingSubject.next(false);
            }),
            catchError(error => {
                console.error('Error generating schedule from backend:', error);
                this.isProcessingSubject.next(false);
                return of([]); // Return empty array on error
            })
        );
    }

    toggleTopicCompletion(topicId: string): void {
        const currentSchedule = this.scheduleSubject.value;
        currentSchedule.forEach(day => {
            day.topics.forEach(topic => {
                if (topic.id === topicId) {
                    topic.completed = !topic.completed;
                }
            });
        });
        this.scheduleSubject.next([...currentSchedule]);
    }

    getTodayPlan(): DailyPlan | undefined {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.scheduleSubject.value.find(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate.getTime() === today.getTime();
        });
    }
}
