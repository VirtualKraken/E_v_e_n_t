import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges, // <--- Import OnChanges
  SimpleChanges, // <--- Import SimpleChanges
} from '@angular/core';
import { FirebaseService } from '../../../service/firebase.service';
import { EventQuote } from '../../types/quotes';

@Component({
  selector: 'event-quote',
  templateUrl: './event-quote.component.html',
  styleUrl: './event-quote.component.scss',
  standalone: false,
})
export class EventQuoteComponent implements OnChanges { // <--- Implement OnChanges
  firebaseService = inject(FirebaseService);

  @Input() initialData: EventQuote[] = [];
  @Output() saveTriggered = new EventEmitter<EventQuote[]>();

  files: EventQuote[] = [];
  selectedFiles: File[] = [];
  isUploading = false;

  // ✅ USE ngOnChanges INSTEAD OF ngOnInit
  ngOnChanges(changes: SimpleChanges) {
    // Check if 'initialData' has changed
    if (changes['initialData'] && changes['initialData'].currentValue) {
      // Create a fresh copy to avoid mutating the input directly
      this.files = [...changes['initialData'].currentValue];
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0) return;

    const MAX_SIZE_MB = 2;
    for (const file of this.selectedFiles) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(
          `File "${file.name}" is too large! Max size is ${MAX_SIZE_MB}MB.`
        );
        return;
      }
    }

    this.isUploading = true;

    try {
      const newFiles: EventQuote[] = [];

      for (const file of this.selectedFiles) {
        const downloadUrl = await this.firebaseService.uploadFileToStorage(
          file
        );

        const fileRecord: EventQuote = {
          name: file.name,
          url: downloadUrl,
          uploadedAt: new Date().toISOString(),
        };
        newFiles.push(fileRecord);
      }

      // Update local list
      this.files = [...this.files, ...newFiles];

      // Emit to Parent
      this.saveTriggered.emit(this.files);
      console.log('Files saved:', this.files);

      // Cleanup
      this.selectedFiles = [];
      const fileInput = document.getElementById(
        'quoteFileUpload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload failed', error);
      alert('Error uploading files. Please try again.');
    } finally {
      this.isUploading = false;
    }
  }

// Make this async so we can wait for the cloud deletion
  async removeFile(index: number) {
    if (!confirm('Are you sure you want to delete this file permanently?')) return;

    const fileToDelete = this.files[index];

    try {
      // 1. Delete from Cloud Storage
      await this.firebaseService.deleteFile(fileToDelete.url);

      // 2. Only if cloud deletion succeeds, remove from UI list
      this.files.splice(index, 1);

      // 3. Save the new list state
      this.saveTriggered.emit(this.files);
      console.log('File deleted from storage and list');

    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Could not delete file from server.');
    }
  }

  // Add this method inside your EventQuoteComponent class

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);

    // If list is empty, reset the input so user can re-select the same file if needed
    if (this.selectedFiles.length === 0) {
      const fileInput = document.getElementById(
        'quoteFileUpload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }
}
