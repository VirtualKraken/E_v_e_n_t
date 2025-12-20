import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
} from '@angular/animations';

export const commonRouteAnimation  = trigger('routeAnimations', [

  transition('* <=> *', [

    // Initial styles
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
      })
    ], { optional: true }),

    // Enter page starts invisible
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(20px)' })
    ], { optional: true }),

    group([
      // Leave animation
      query(':leave', [
        animate('200ms ease-out',
          style({ opacity: 0, transform: 'translateX(-20px)' })
        )
      ], { optional: true }),

      // Enter animation
      query(':enter', [
        animate('250ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        )
      ], { optional: true }),
    ])
  ])
]);
