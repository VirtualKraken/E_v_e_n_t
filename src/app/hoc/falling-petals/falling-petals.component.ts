import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

interface Petal {
  id: number;
  left: string;
  size: string;
  duration: string;
  swayDuration: string;
  blur: string;
  color: string;
}

@Component({
  selector: 'falling-petals',
  templateUrl: './falling-petals.component.html',
  styleUrl: './falling-petals.component.scss',
  standalone: false,
})
export class FallingPetalsComponent implements OnInit, OnDestroy {
  petals: Petal[] = [];
  private nextId = 0;
  private intervalId: any;

  // Premium event palette: soft pinks, whites, and champagne
  private colors = ['#ffb7c5', '#ff99aa', '#ffe4e1', '#ffffff', '#fdf5e6'];

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    // Run outside Angular to keep the login form inputs snappy
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.addPetal();
      }, 100); // Slightly slower rate feels more elegant
    });
  }

addPetal() {
  const id = this.nextId++;

  const newPetal: Petal = {
    id: id,
    left: Math.random() * 100 + '%',
    size: (Math.random() * 12 + 8) + 'px', // Slightly smaller looks better when there are many
    duration: (Math.random() * 5 + 5) + 's',
    swayDuration: (Math.random() * 2 + 2) + 's',
    blur: Math.random() > 0.8 ? '1px' : '0px',
    color: this.colors[Math.floor(Math.random() * this.colors.length)]
  };

  this.ngZone.run(() => {
    this.petals.push(newPetal);
  });

  // Keep them alive slightly longer than the longest animation duration
  setTimeout(() => {
    this.ngZone.run(() => {
      this.petals = this.petals.filter((p) => p.id !== id);
    });
  }, 11000);
}

  trackById(index: number, item: Petal): number {
    return item.id;
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
