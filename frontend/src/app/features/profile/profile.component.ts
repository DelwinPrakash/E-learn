import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from 'src/app/core/services/user.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user$!: Observable<UserProfile>;

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.user$ = this.userService.getUserProfile();
    }
}
