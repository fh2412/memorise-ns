import { inject, Injectable } from '@angular/core';
import { Observable, defer } from 'rxjs';
import {
  deleteObject, getMetadata, Storage, ref, updateMetadata, uploadBytesResumable,
  listAll, getDownloadURL, StorageReference, FullMetadata,
} from '@angular/fire/storage';
import { BillingService, DeletionData } from './billing.service';
import { StoredObject } from '@models/photo-upload.model';

export interface StorageUploadEvent {
  bytesTransferred: number;
  totalBytes: number;
  /** Set on the final emission. */
  result?: StoredObject;
}

export interface UploadBlobOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

/** Object names are UUIDs and never overwritten with different content → cache aggressively. */
const IMMUTABLE_CACHE_CONTROL = 'private, max-age=31536000, immutable';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private storage = inject(Storage);
  private billingService = inject(BillingService);

  // ── Generic upload (used by UploadQueueService) ────────────────────────────

  /**
   * Resumable upload with progress. Unsubscribing cancels the running upload.
   */
  uploadBlob(path: string, data: Blob, options: UploadBlobOptions = {}): Observable<StorageUploadEvent> {
    return new Observable<StorageUploadEvent>(observer => {
      const storageRef = ref(this.storage, path);
      const task = uploadBytesResumable(storageRef, data, {
        contentType: options.contentType || data.type || undefined,
        customMetadata: options.customMetadata,
        cacheControl: IMMUTABLE_CACHE_CONTROL,
      });

      let finished = false;
      const unsubscribe = task.on(
        'state_changed',
        snapshot => observer.next({ bytesTransferred: snapshot.bytesTransferred, totalBytes: snapshot.totalBytes }),
        error => {
          finished = true;
          observer.error(error);
        },
        async () => {
          finished = true;
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            const size = task.snapshot.totalBytes;
            observer.next({ bytesTransferred: size, totalBytes: size, result: { path, url, sizeBytes: size } });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        },
      );

      return () => {
        unsubscribe();
        if (!finished) task.cancel();
      };
    });
  }

  /**
   * Removes objects that were uploaded but never registered in the backend
   * (canceled uploads). No billing update – they were never counted.
   */
  async deleteUnregisteredObjects(paths: string[]): Promise<void> {
    await Promise.allSettled(paths.map(path => deleteObject(ref(this.storage, path))));
  }

  // ── Deletion ───────────────────────────────────────────────────────────────

  /** Deletes all objects of a memory incl. sub folders (thumbs/). */
  deleteMemorysFolder(memoryId: string): Observable<void> {
    return defer(async () => {
      const refs = await this.listAllRecursive(ref(this.storage, `memories/${memoryId}`));
      await this.deleteObjectsWithBilling(refs);
    });
  }

  /** Deletes images by download URL – and their thumbnails if they exist. */
  deleteImages(imageUrls: string[]): Observable<void> {
    return defer(async () => {
      if (!imageUrls?.length) return;
      const refs = imageUrls
        .map(url => ref(this.storage, url))
        .flatMap(r => {
          const thumb = this.thumbnailRefFor(r);
          return thumb ? [r, thumb] : [r];
        });
      await this.deleteObjectsWithBilling(refs);
    });
  }

  /**
   * FIX: metadata is read BEFORE deleting (previously ran in parallel → race),
   * and missing objects (e.g. legacy photos without thumbnail) are skipped instead of failing everything.
   */
  private async deleteObjectsWithBilling(refs: StorageReference[]): Promise<void> {
    const metadata = await Promise.allSettled(refs.map(r => getMetadata(r)));
    const existing = metadata.flatMap((result, i) =>
      result.status === 'fulfilled' ? [{ ref: refs[i], meta: result.value }] : [],
    );
    if (existing.length === 0) return;

    await Promise.all(existing.map(e => deleteObject(e.ref)));

    const deletionData: DeletionData[] = existing
      .filter(e => e.meta.customMetadata?.['userId'])
      .map(e => this.toDeletionData(e.meta));

    try {
      await this.billingService.updateStorageOnDeletion(deletionData);
    } catch (error) {
      // Files are gone either way – log, don't fail the deletion.
      console.error('Billing update after deletion failed:', error);
    }
  }

  private toDeletionData(meta: FullMetadata): DeletionData {
    return { size: meta.size, userId: meta.customMetadata!['userId'], path: meta.fullPath };
  }

  private async listAllRecursive(folder: StorageReference): Promise<StorageReference[]> {
    const result = await listAll(folder);
    const nested = await Promise.all(result.prefixes.map(prefix => this.listAllRecursive(prefix)));
    return [...result.items, ...nested.flat()];
  }

  /** memories/{id}/{photoId}.{ext} → memories/{id}/thumbs/{photoId}.jpg */
  private thumbnailRefFor(original: StorageReference): StorageReference | null {
    const parent = original.parent;
    if (!parent || parent.name === 'thumbs') return null;
    const baseName = original.name.replace(/\.[^.]+$/, '');
    return ref(this.storage, `${parent.fullPath}/thumbs/${baseName}.jpg`);
  }

  // ── Profile picture (unchanged) ────────────────────────────────────────────

  uploadProfilePicture(file: File, userId: string): Observable<{ profileUrl: string, thumbnailUrl: string }> {
    return new Observable((observer) => {
      const filePath = `profile-pictures/${userId}/profile.jpg`;
      const thumbnailPath = `profile-pictures/${userId}/thumbnail.jpg`;

      const storageRef = ref(this.storage, filePath);
      const thumbnailRef = ref(this.storage, thumbnailPath);

      this.createThumbnail(file, 128).then((thumbnailFile) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        const thumbnailUploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);

        let mainUploadComplete = false;
        let thumbnailUploadComplete = false;
        let profileUrl = '';
        let thumbnailUrl = '';

        const checkCompletion = () => {
          if (mainUploadComplete && thumbnailUploadComplete) {
            observer.next({ profileUrl, thumbnailUrl });
            observer.complete();
          }
        };

        uploadTask.on(
          'state_changed',
          () => { /* progress not needed */ },
          (error) => observer.error(error),
          async () => {
            profileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            mainUploadComplete = true;
            checkCompletion();
          }
        );

        thumbnailUploadTask.on(
          'state_changed',
          () => { /* progress not needed */ },
          (error) => observer.error(error),
          async () => {
            thumbnailUrl = await getDownloadURL(thumbnailUploadTask.snapshot.ref);
            thumbnailUploadComplete = true;
            checkCompletion();
          }
        );
      }).catch((error) => observer.error(error));
    });
  }

  private createThumbnail(file: File, minSize: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const [newWidth, newHeight] = width < height
          ? [minSize, Math.round((height * minSize) / width)]
          : [Math.round((width * minSize) / height), minSize];

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
          else reject(new Error('Failed to create thumbnail blob'));
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // ── Legacy ─────────────────────────────────────────────────────────────────
  starImage(index: number, starredIndex: number | null, oldStarredImageUrl: string, newStarredImageUrl: string) {
    if (starredIndex !== null && starredIndex !== index) {
      const prevImageRef = ref(this.storage, oldStarredImageUrl);
      getMetadata(prevImageRef).then((metadata) => {
        updateMetadata(prevImageRef, { customMetadata: { ...metadata.customMetadata, isStarred: 'false' } });
      });
    }

    const newImageRef = ref(this.storage, newStarredImageUrl);
    getMetadata(newImageRef).then((metadata) => {
      updateMetadata(newImageRef, { customMetadata: { ...metadata.customMetadata, isStarred: 'true' } });
    });
  }
}
