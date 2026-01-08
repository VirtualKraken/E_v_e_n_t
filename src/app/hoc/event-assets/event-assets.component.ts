import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AssetDetails, EventInfo } from '../../types/quotes';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';

interface Asset {
  id: string;
  name: string;
  quantity: number;
  takenOut: boolean;
  broughtBack: boolean;
}

@Component({
  selector: 'event-assets',
  templateUrl: './event-assets.component.html',
  styleUrl: './event-assets.component.scss',
  standalone: false,
})
export class EventAssetsComponent implements OnInit, OnChanges {
  @Input() initialData: AssetDetails | undefined;
  @Input() eventInfo: EventInfo | undefined;
  @Output() saveTriggered = new EventEmitter<AssetDetails>();

  @ViewChild('addNameInput') addNameInput!: ElementRef;

  user = localStorage.getItem('eeUser');
  // Data
  assets: Asset[] = [];
  sharedWith: string = 'none';

  // UI State
  editMode: { [key: string]: boolean } = {};
  editForms: { [key: string]: { name: string; quantity: number } } = {};

  // Add row form
  newAssetName: string = '';
  newAssetQuantity: number = 1;

  constructor(private route: ActivatedRoute, private datePipe: DatePipe) {}

  ngOnInit() {
    this.loadData();
  }

  // Listen for async data updates or lazy load init
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && !changes['initialData'].firstChange) {
      this.loadData();
    }
  }

  loadData() {
    if (this.initialData) {
      this.sharedWith = this.initialData.shared_with || 'none';

      if (this.initialData.items && Array.isArray(this.initialData.items)) {
        // Map incoming data to local Asset interface ensuring all fields exist
        this.assets = this.initialData.items.map((item: any) => ({
          id: item.id || this.generateId(),
          name: item.name || item.item_name, // fallback if naming differs
          quantity: item.quantity || item.item_count || 0,
          takenOut: item.takenOut || false,
          broughtBack: item.broughtBack || false,
        }));
      } else {
        this.assets = [];
      }
    }
  }

  /**
   * Centralized emitter.
   * Called whenever data is modified to sync with parent.
   */
  emitChanges() {
    // Cast to any or map strictly to AssetDetails structure required by parent
    const payload: any = {
      shared_with: this.sharedWith,
      items: this.assets,
    };
    this.saveTriggered.emit(payload);
  }

  onSharedWithChange() {
    this.emitChanges();
  }

  toggleTakenOut(asset: Asset) {
    // If unchecked (brought back in), reset the brought back status
    if (asset.takenOut) {
      asset.broughtBack = false;
    }
    this.emitChanges();
  }

  toggleBroughtBack(asset: Asset) {
    if (!asset.takenOut) {
      // If "Out" is not checked, prevent checking "Back"
      setTimeout(() => (asset.broughtBack = false), 0);
      return; // Do not emit, invalid state
    }
    this.emitChanges();
  }

  startEdit(asset: Asset) {
    this.editMode[asset.id] = true;
    this.editForms[asset.id] = {
      name: asset.name,
      quantity: asset.quantity,
    };
  }

  cancelEdit(assetId: string) {
    this.editMode[assetId] = false;
    delete this.editForms[assetId];
  }

  saveEdit(asset: Asset) {
    if (this.editForms[asset.id]) {
      const form = this.editForms[asset.id];
      if (form.name.trim() && form.quantity > 0) {
        asset.name = form.name.trim();
        asset.quantity = form.quantity;
        this.editMode[asset.id] = false;
        delete this.editForms[asset.id];

        this.emitChanges(); // Trigger Save
      }
    }
  }

  deleteAsset(assetId: string) {
    if (confirm('Delete this item?')) {
      const index = this.assets.findIndex((a) => a.id === assetId);
      if (index !== -1) {
        this.assets.splice(index, 1);
        this.emitChanges(); // Trigger Save
      }
    }
  }

  addNewAsset() {
    if (this.newAssetName.trim() && this.newAssetQuantity > 0) {
      const newAsset: Asset = {
        id: this.generateId(),
        name: this.newAssetName.trim(),
        quantity: this.newAssetQuantity,
        takenOut: false,
        broughtBack: false,
      };

      this.assets.push(newAsset);
      this.emitChanges(); // Trigger Save

      // Reset form
      this.newAssetName = '';
      this.newAssetQuantity = 1;

      // Focus back to name input
      setTimeout(() => {
        if (this.addNameInput) {
          this.addNameInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  canAddAsset(): boolean {
    return this.newAssetName.trim().length > 0 && this.newAssetQuantity > 0;
  }

  // Statistics Helpers (Optional for UI)
  getTotalAssets(): number {
    return this.assets.reduce((sum, asset) => sum + asset.quantity, 0);
  }

  private generateId(): string {
    return (
      'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  share() {
    if (!this.eventInfo) {
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    console.log(this.eventInfo);
    const title = 'CheckList';

    const formattedDate = this.datePipe.transform(
      this.eventInfo?.function_date,
      'dd MMM yyyy'
    );
    const text = `${formattedDate} - ${this.eventInfo?.venue}, ${this.eventInfo?.location}`;
    const url = `${environment.firebase.siteUrl}production-checklist/${id}`;

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url,
      });
    } else {
      this.shareFallback(url);
    }
  }
  shareFallback(url: string) {
    const message = encodeURIComponent(url);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
}
