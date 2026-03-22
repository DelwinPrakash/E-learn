import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateQuizService } from '../services/create-quiz.service';

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

  aiPrompt: string = '';
  aiDifficulty: string = 'medium';
  aiNumQuestions: number = 5;
  isGeneratingAI: boolean = false;
  aiErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private createQuizService: CreateQuizService,
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

  generateAIQuiz() {
    if (!this.aiPrompt.trim()) {
      this.aiErrorMessage = "Please enter a topic prompt first.";
      return;
    }
    
    this.isGeneratingAI = true;
    this.aiErrorMessage = '';
    
    // Boundary checks
    const finalCount = Math.min(Math.max(this.aiNumQuestions || 5, 1), 15);
    
    const payload = {
      topicPrompt: this.aiPrompt,
      difficulty: this.aiDifficulty,
      numQuestions: finalCount
    };

    this.createQuizService.generateAIQuiz(payload).subscribe({
      next: (response: any) => {
        this.isGeneratingAI = false;
        if (Array.isArray(response) && response.length > 0) {
          this.questions.clear();
          response.forEach((q: any) => {
            const optionsArray = this.fb.array(
              q.options.map((opt: string) => this.fb.control(opt, Validators.required))
            );
            this.questions.push(this.fb.group({
              text: [q.text, Validators.required],
              options: optionsArray,
              correctIndex: [q.correctIndex || 0, Validators.required],
              difficulty: [payload.difficulty]
            }));
          });
          this.aiPrompt = '';
        }
      },
      error: (err) => {
        this.isGeneratingAI = false;
        this.aiErrorMessage = err.error?.message || "Failed to generate AI quiz.";
      }
    });
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

    this.createQuizService.createQuiz(this.quizForm.value).subscribe({
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
