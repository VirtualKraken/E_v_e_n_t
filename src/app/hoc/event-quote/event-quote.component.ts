import { Component } from '@angular/core';
import { sampleQuoteData } from '../../../assets/constants';
import { WeddingQuotation } from '../../types/quotes';


@Component({
  selector: 'event-quote',
  templateUrl: './event-quote.component.html',
  styleUrl: './event-quote.component.scss',
  standalone:false
})
export class EventQuoteComponent {
  quoteData:WeddingQuotation|null=sampleQuoteData;

}
