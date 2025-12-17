import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscussionfomrComponent } from './discussionforum.component';

describe('DiscussionfomrComponent', () => {
  let component: DiscussionfomrComponent;
  let fixture: ComponentFixture<DiscussionfomrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscussionfomrComponent ]
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
  });

  it('should create new thread', () => {
    const initialCount = component.threads.length;
    component.newThreadTitle = 'Test Thread';
    component.newThreadContent = 'Test Content';
    component.createNewThread();
    expect(component.threads.length).toBe(initialCount + 1);
  });

  it('should select thread and show detail', () => {
    if (component.threads.length > 0) {
      component.selectThread(component.threads[0]);
      expect(component.showThreadDetail).toBe(true);
      expect(component.selectedThread).toBeTruthy();
    }
  });

  it('should add reply to thread', () => {
    if (component.threads.length > 0) {
      component.selectThread(component.threads[0]);
      const initialReplyCount = component.replies.length;
      component.newReplyContent = 'Test Reply';
      component.addReply();
      expect(component.replies.length).toBe(initialReplyCount + 1);
    }
  });
});
