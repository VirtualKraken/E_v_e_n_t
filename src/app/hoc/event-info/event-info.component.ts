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
  // 1. Receive data from Parent
  @Input() initialData: EventInfo | undefined;

  @Output() saveTriggered = new EventEmitter<EventInfo>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      clientName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      venue: ['', Validators.required],
      location: [''],
    });
  }

  // 2. Listen for data changes
  ngOnChanges(changes: SimpleChanges): void {
    // If 'initialData' has changed and is not null/undefined
    if (changes['initialData'] && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  // 3. Patch the form values
  populateForm(data: EventInfo) {
    this.form.patchValue({
      clientName: data.client_name,
      phone: data.phone,
      venue: data.venue,
      location: data.location || '',
      date: data.function_date ? new Date(data.function_date) : null,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // ... existing submit logic ...
    const formVal = this.form.value;
    const eventInfoData: EventInfo = {
      client_name: formVal.clientName,
      phone: formVal.phone,
      function_date: formVal.date.toISOString(),
      venue: formVal.venue,
      location: formVal.location || '',
    };
    this.saveTriggered.emit(eventInfoData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
