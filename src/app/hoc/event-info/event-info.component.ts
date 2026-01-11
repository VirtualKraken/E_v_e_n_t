import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventInfo, EvolveEvent } from '../../types/quotes';
import { COUNTRY_CODES } from '../../../assets/constants';
import { count } from 'firebase/firestore';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrl: './event-info.component.scss',
  standalone: false,
})
export class EventInfoComponent implements OnChanges {
  @Input() initialData: EventInfo | undefined;
  @Input() fullData: EvolveEvent | undefined | null;
  @Output() saveTriggered = new EventEmitter<EventInfo>();
  @Output() cancel = new EventEmitter<void>();
  countryCodes = COUNTRY_CODES;

  form: FormGroup;
  isLocked = true; // 1. State variable for UI toggling
  totalExpense: any;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      clientName: ['', Validators.required],
      countryCode: ['+91'],
      phone: ['', [Validators.pattern(/^[0-9\s\-\(\)]{7,20}$/)]],
      venue: [''],
      location: [''],
      quotedAmount: [0],
      notes: [''],
      entry: [''],
      confirmed: [false],
    });

    // 2. Default State: Disable the form immediately
    this.form.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.populateForm(this.initialData);

      // OPTIONAL: If this is an existing event, ensure it starts locked
      this.isLocked = true;
      this.form.disable();
    } else if (changes['initialData'] && !this.initialData) {
      // OPTIONAL: If it's a NEW event (no data), auto-unlock so user can type
      this.unlockForm();
    }
  }

  populateForm(data: EventInfo) {
    this.form.patchValue({
      clientName: data.client_name,
      countryCode: data.countryCode,
      quotedAmount: data.quotedAmount || 0,
      phone: data.phone,
      venue: data.venue,
      location: data.location || '',
      date: data.function_date ? new Date(data.function_date) : null,
      entry: data.entry || '',
      notes: data.notes || '',
      confirmed: data.confirmed || false,
    });
    this.calculateExpense();
  }

  calculateExpense() {
    this.totalExpense = this.fullData?.event_crew.reduce(
      (sum, member) => sum + (member.amount || 0),
      0
    );
  }

  // 3. Unlock Action
  unlockForm() {
    this.isLocked = false;
    this.form.enable(); // Enables all inputs
  }

  // 4. Cancel Action (Re-lock and Reset)
  onCancel() {
    this.isLocked = true;
    this.form.disable(); // Disables all inputs

    // Reset form to original data to undo changes
    if (this.initialData) {
      this.populateForm(this.initialData);
    }

    this.cancel.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formVal = this.form.value;

    // Prepare the data object
    const eventInfoData: EventInfo = {
      client_name: formVal.clientName,
      countryCode: formVal.countryCode,
      quotedAmount: formVal.quotedAmount || 0,
      phone: formVal.phone,
      function_date: formVal.date.toISOString(),
      venue: formVal.venue,
      location: formVal.location || '',
      notes: formVal.notes || '',
      entry: formVal.entry || '',
      confirmed: formVal.confirmed || false,
    };

    // 1. Emit the data to the parent
    this.saveTriggered.emit(eventInfoData);

    // 2. Lock the form immediately
    this.isLocked = true;
    this.form.disable();
  }

  calculateProfit(): number {
    // update bar color based on profit,

  const quoted = this.form.value.quotedAmount || 0;
  return quoted - this.totalExpense;
}

calculateMargin(): number {
  const quoted = this.form.value.quotedAmount || 0;
  if (quoted === 0) return 0;
  const profit = this.calculateProfit();
  // Returns percentage of profit relative to revenue
  return (profit / quoted) * 100;
}


}
