import { Component, Input } from '@angular/core';

@Component({
    selector: 'evolve-side-nav-content',
    templateUrl: './evolve-side-nav-content.component.html',
    styleUrl: './evolve-side-nav-content.component.scss',
    standalone: false
})
export class EvolveSideNavContentComponent {
  @Input() drawer: any;
}
