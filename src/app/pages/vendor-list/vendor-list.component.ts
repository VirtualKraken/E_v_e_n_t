import { Component, TemplateRef, ViewChild, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService, Vendor } from '../../../service/firebase.service';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss'],
  standalone:false
})
export class VendorListComponent implements OnInit {
  // Services
  private firebaseService = inject(FirebaseService); // Injected your main service
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  // Data
  allVendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  serviceFilter: string = '';

  // Unique list of services for the dropdown
  availableServices: string[] = [];

  // Form
  vendorForm: FormGroup;
  isEditMode = false;
  currentVendorId: string | null = null;

  @ViewChild('vendorModal') vendorModal!: TemplateRef<any>;

  constructor() {
    this.vendorForm = this.fb.group({
      name: ['', Validators.required],
      service: ['', Validators.required],
      location: [''],
      phone: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    // Call the new method from FirebaseService
    this.firebaseService.getVendors().subscribe(vendors => {
      this.allVendors = vendors;
      this.extractServices();
      this.applyFilter();
    });
  }

  // --- Logic ---

  extractServices() {
    const services = this.allVendors.map(v => v.service);
    // clean up empty services and get unique values
    this.availableServices = [...new Set(services.filter(s => s))];
  }

  applyFilter() {
    if (!this.serviceFilter) {
      this.filteredVendors = this.allVendors;
    } else {
      this.filteredVendors = this.allVendors.filter(v =>
        v.service.toLowerCase() === this.serviceFilter.toLowerCase()
      );
    }
  }

  // --- Modal & Form Actions ---

  openAddModal() {
    this.isEditMode = false;
    this.currentVendorId = null;
    this.vendorForm.reset();
    this.dialog.open(this.vendorModal, { width: '400px' });
  }

  openEditModal(vendor: Vendor) {
    this.isEditMode = true;
    this.currentVendorId = vendor.id!;
    this.vendorForm.patchValue(vendor);
    this.dialog.open(this.vendorModal, { width: '400px' });
  }

  async saveVendor() {
    if (this.vendorForm.invalid) return;

    const formValue = this.vendorForm.value;

    try {
      if (this.isEditMode && this.currentVendorId) {
        // Update existing vendor
        const vendorData: Vendor = { id: this.currentVendorId, ...formValue };
        await this.firebaseService.updateVendor(vendorData);
      } else {
        // Add new vendor
        await this.firebaseService.addVendor(formValue);
      }
      this.dialog.closeAll();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  }
}
