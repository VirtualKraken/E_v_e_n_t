import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'evolve-top-nav',
    templateUrl: './evolve-top-nav.component.html',
    styleUrls: ['./evolve-top-nav.component.scss'],
    standalone: false
})
export class EvolveTopNavComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  user=localStorage.getItem('eeUser');
}
