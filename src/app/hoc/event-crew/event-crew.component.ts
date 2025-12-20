import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

interface CrewMember {
  serviceType: string;
  name: string;
  phone: string;
  amount: number;
}

@Component({
  selector: 'event-crew',
  templateUrl: './event-crew.component.html',
  styleUrls: ['./event-crew.component.scss'],
})
export class EventCrewComponent {
  crew: CrewMember[] = [];
  services = ['MC', 'Lights', 'Sound', 'DJ', 'Band', 'Dancers'];
  crewForm: FormGroup;

  @ViewChild('addCrewDialog') addCrewDialog!: TemplateRef<any>;

  private currentDialogRef?: MatDialogRef<any>;

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.crewForm = this.fb.group({
      serviceType: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      amount: [null, [Validators.required, Validators.min(0)]],
    });
  }

  openAddCrewDialog() {
    this.crewForm.reset();
    this.currentDialogRef = this.dialog.open(this.addCrewDialog, {
      width: '400px',
      disableClose: true
    });
  }

  submitCrewForm() {
    if (this.crewForm.valid) {
      this.crew.push(this.crewForm.value);
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
    }
  }

  getTotalAmount(): number {
    return this.crew.reduce((sum, member) => sum + member.amount, 0);
  }

  submitEvent() {
    if (this.crew.length === 0) {
      alert('Please add at least one crew member before submitting.');
      return;
    }
    console.log('Crew List:', this.crew);
    console.log('Total Amount:', this.getTotalAmount());
    // Add your submit logic here (e.g., HTTP request)
  }
}
