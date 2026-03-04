import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailverificationComponent } from './emailverification.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('EmailverificationComponent', () => {
  let component: EmailverificationComponent;
  let fixture: ComponentFixture<EmailverificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmailverificationComponent, HttpClientTestingModule, RouterTestingModule]
    });
    fixture = TestBed.createComponent(EmailverificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
