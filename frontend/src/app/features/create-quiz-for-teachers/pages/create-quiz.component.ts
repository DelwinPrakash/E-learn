import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-create-quiz',
  templateUrl: './create-quiz.component.html',
  styleUrls: ['./create-quiz.component.css']
})
export class TeacherCreateQuizComponent implements OnInit {
  quizForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      courseId: [''],
      difficulty: ['medium', Validators.required],
      questions: this.fb.array([this.createQuestion()])
    });
  }

  ngOnInit(): void {}

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      correctIndex: [0, Validators.required],
      difficulty: ['medium']
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  setCorrectIndex(qIndex: number, optIndex: number): void {
    this.questions.at(qIndex).get('correctIndex')?.setValue(optIndex);
  }

  onSubmit(): void {
    if (this.quizForm.invalid) {
      this.errorMessage = 'Please fill out all required fields properly.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/api/quiz/create', this.quizForm.value, { headers }).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.successMessage = 'Quiz created successfully!';
        this.quizForm.reset({ difficulty: 'medium' });
        this.questions.clear();
        this.questions.push(this.createQuestion());
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create quiz. Please try again.';
      }
    });
  }
}
