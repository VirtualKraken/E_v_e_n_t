import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../service/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent {
  constructor(private router: Router, private fs: FirebaseService) {}

  openEventDetails() {
    this.router.navigate(['/event-details']);
  }

ngOnInit(): void {
  this.fs.getUsers$().subscribe(users => {
    console.log(users);
  });
}

}
