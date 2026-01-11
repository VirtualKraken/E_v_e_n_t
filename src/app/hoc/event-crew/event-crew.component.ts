import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventCrew } from '../../types/quotes';
import { EVENT_SERVICES } from '../../../assets/constants';

@Component({
  selector: 'event-crew',
  templateUrl: './event-crew.component.html',
  styleUrls: ['./event-crew.component.scss'],
  standalone: false,
})
export class EventCrewComponent implements OnInit, OnChanges {
  crew: EventCrew[] = [];

  services = EVENT_SERVICES;

  crewForm: FormGroup;

  @Input() initialData: EventCrew[] | undefined;
  @Output() saveTriggered = new EventEmitter<EventCrew[]>();

  @ViewChild('addCrewDialog') addCrewDialog!: TemplateRef<any>;
  private currentDialogRef?: MatDialogRef<any>;

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    // Defines form with snake_case to match interface directly
    this.crewForm = this.fb.group({
      service_type: [''],
      person_name: ['', Validators.required],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      amount: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.crew = [...this.initialData];
    }
  }

  // Handles input updates if data arrives async
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.crew = [...changes['initialData'].currentValue];
    }
  }

  openAddCrewDialog() {
    this.crewForm.reset();
    this.currentDialogRef = this.dialog.open(this.addCrewDialog, {
      width: '400px',
      disableClose: true,
    });
  }

  submitCrewForm() {
    if (this.crewForm.valid) {
      // Form structure matches Interface (snake_case), so no mapping needed
      this.crew.push(this.crewForm.value);

      this.triggerSave(); // Emit change immediately

      this.currentDialogRef?.close();
      this.crewForm.reset();
    } else {
      this.crewForm.markAllAsTouched();
    }
  }

  cancelDialog() {
    this.currentDialogRef?.close();
    this.crewForm.reset();
  }

  removeCrew(index: number) {
    if (confirm('Are you sure you want to remove this crew member?')) {
      this.crew.splice(index, 1);
      this.triggerSave(); // Emit change immediately
    }
  }

  triggerSave() {
    this.saveTriggered.emit(this.crew);
    // console.log(this.crew);
  }

  getTotalAmount(): number {
    return this.crew.reduce((sum, member) => sum + (member.amount || 0), 0);
  }
}
