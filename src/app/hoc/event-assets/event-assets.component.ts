import { Component, ViewChild, ElementRef } from '@angular/core';

interface Asset {
  id: string;
  name: string;
  quantity: number;
  takenOut: boolean;
  broughtBack: boolean;
  takenOutTime?: Date;
  broughtBackTime?: Date;
}

@Component({
  selector: 'event-assets',
  templateUrl: './event-assets.component.html',
  styleUrl: './event-assets.component.scss',
})
export class EventAssetsComponent {
  assets: Asset[] = [];
  editMode: { [key: string]: boolean } = {};
  editForms: { [key: string]: { name: string; quantity: number } } = {};

  // Add row form
  newAssetName: string = '';
  newAssetQuantity: number = 1;

  @ViewChild('addNameInput') addNameInput!: ElementRef;

  toggleTakenOut(asset: Asset) {
    // ngModel already toggled the value, just handle side effects
    if (asset.takenOut) {
      asset.takenOutTime = new Date();
      asset.broughtBack = false;
      asset.broughtBackTime = undefined;
    } else {
      asset.takenOutTime = undefined;
    }
  }

  toggleBroughtBack(asset: Asset) {
    // ngModel already toggled the value
    if (!asset.takenOut) {
      // If "Out" is not checked, prevent checking "Back"
      asset.broughtBack = false;
      return;
    }

    if (asset.broughtBack) {
      asset.broughtBackTime = new Date();
    } else {
      asset.broughtBackTime = undefined;
    }
  }

  startEdit(asset: Asset) {
    this.editMode[asset.id] = true;
    this.editForms[asset.id] = {
      name: asset.name,
      quantity: asset.quantity
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
      }
    }
  }

  deleteAsset(assetId: string) {
    if (confirm('Delete this item?')) {
      const index = this.assets.findIndex(a => a.id === assetId);
      if (index !== -1) {
        this.assets.splice(index, 1);
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
        broughtBack: false
      };

      this.assets.push(newAsset);

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

  getTotalAssets(): number {
    return this.assets.reduce((sum, asset) => sum + asset.quantity, 0);
  }

  getTakenOutCount(): number {
    return this.assets.filter(asset => asset.takenOut).length;
  }

  getBroughtBackCount(): number {
    return this.assets.filter(asset => asset.broughtBack).length;
  }

  getPendingReturnCount(): number {
    return this.assets.filter(asset => asset.takenOut && !asset.broughtBack).length;
  }

  private generateId(): string {
    return 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
