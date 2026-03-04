import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscussionfomrComponent } from './discussionforum.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DiscussionService } from '../services/discussion.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('DiscussionfomrComponent', () => {
  let component: DiscussionfomrComponent;
  let fixture: ComponentFixture<DiscussionfomrComponent>;
  let mockDiscussionService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockDiscussionService = {
      getThreads: jasmine.createSpy('getThreads').and.returnValue(of([
        { id: '1', title: 'Test Thread', content: 'Test Content', author: 'Test Author', replies: 0, views: 0, createdAt: new Date().toISOString(), lastReplyAt: new Date().toISOString() }
      ])),
      createThread: jasmine.createSpy('createThread').and.returnValue(of({})),
      getReplies: jasmine.createSpy('getReplies').and.returnValue(of([])),
      addReply: jasmine.createSpy('addReply').and.returnValue(of({}))
    };

    mockAuthService = {
      user$: of({ name: 'Test User', user_id: '123', role: 'student' }),
      getUser: jasmine.createSpy('getUser').and.returnValue({ name: 'Test User', user_id: '123', role: 'student' })
    };

    await TestBed.configureTestingModule({
      declarations: [DiscussionfomrComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: DiscussionService, useValue: mockDiscussionService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DiscussionfomrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load threads on init', () => {
    expect(component.threads.length).toBeGreaterThan(0);
    expect(mockDiscussionService.getThreads).toHaveBeenCalled();
  });

  it('should create new thread', () => {
    component.newThreadTitle = 'Test Thread';
    component.newThreadContent = 'Test Content';
    component.createNewThread();
    expect(mockDiscussionService.createThread).toHaveBeenCalled();
    expect(mockDiscussionService.getThreads).toHaveBeenCalledTimes(2);
  });

  it('should select thread and show detail', () => {
    if (component.threads.length > 0) {
      component.selectThread(component.threads[0]);
      expect(component.showThreadDetail).toBe(true);
      expect(component.selectedThread).toBeTruthy();
      expect(mockDiscussionService.getReplies).toHaveBeenCalled();
    }
  });

  it('should add reply to thread', () => {
    if (component.threads.length > 0) {
      component.selectThread(component.threads[0]);
      component.newReplyContent = 'Test Reply';
      component.addReply();
      expect(mockDiscussionService.addReply).toHaveBeenCalled();
      expect(mockDiscussionService.getReplies).toHaveBeenCalledTimes(2);
    }
  });
});
