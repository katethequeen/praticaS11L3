import { Component, OnInit } from '@angular/core';
import { iUser } from '../../interfaces/i-user';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  user!: iUser;

  constructor(private authSvc: AuthService) {}

  ngOnInit(): void {
    this.authSvc.user$.subscribe((user) => {
      if (!user) return;
      this.user = user;
    });
  }
}
