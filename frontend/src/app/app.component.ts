import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  projectName = 'AI Learning System';
  teamCount = 4;
  buttonDisabled = true;
  message = '';
  showMessage() {
    this.message = 'Button was clicked!';
  }
}
