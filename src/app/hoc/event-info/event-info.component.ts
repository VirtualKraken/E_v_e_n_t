import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrl: './event-info.component.scss'
})
export class EventInfoComponent {
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: [null, Validators.required],
      clientName: ['', Validators.required],
      quotedAmount: [null, [Validators.required, Validators.min(0)]],
      venue: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitForm.emit(this.form.value);
  }

  onCancel() {
    this.cancel.emit();
  }
}
