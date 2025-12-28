import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventInfo } from '../../types/quotes';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrl: './event-info.component.scss',
  standalone: false,
})
export class EventInfoComponent implements OnChanges {
  @Input() initialData: EventInfo | undefined;
  @Output() saveTriggered = new EventEmitter<EventInfo>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  isLocked = true; // 1. State variable for UI toggling

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      clientName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      venue: ['', Validators.required],
      location: [''],
      notes: [''],
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
      phone: data.phone,
      venue: data.venue,
      location: data.location || '',
      date: data.function_date ? new Date(data.function_date) : null,
    });
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
      phone: formVal.phone,
      function_date: formVal.date.toISOString(),
      venue: formVal.venue,
      location: formVal.location || '',
      notes: formVal.notes || '',
    };

    // 1. Emit the data to the parent
    this.saveTriggered.emit(eventInfoData);

    // 2. Lock the form immediately
    this.isLocked = true;
    this.form.disable();
  }
}
