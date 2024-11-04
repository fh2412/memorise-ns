import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/userService';
import { MatDialog } from '@angular/material/dialog';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { DateRange } from '@angular/material/datepicker';
import { LocationService } from '../../services/location.service';
import { FullDescriptionDialogComponent } from '../../components/_dialogs/full-description-dialog/full-description-dialog.component';
import { ImageGalleryService } from '../../services/image-gallery.service';
import { ConfirmationDialogData, ConfirmDialogComponent } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { Memory } from '../../models/memoryInterface.model';
import { Friend, MemoriseUser } from '../../models/userInterface.model';
import { MemoriseLocation } from '../../models/location.model';


export interface ImageWithMetadata {
  url: string;
  width: number;
  height: number;
}


@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: 'memory-detail.component.scss'
})
export class MemoryDetailComponent {
  memorydb!: Memory;
  memoryID: number = 0;
  memoryCreator!: MemoriseUser;
  loggedInUserId: string | null = null;
  memorydbFriends: Friend[] | null = [];
  selectedDate = new Date(2024, 1, 1);
  endDate = new Date(2024, 1, 1);
  dateRange!: DateRange<Date>;
  location: MemoriseLocation | null = null;

  displayedColumns: string[] = ['profilePicture', 'name', 'birthday', 'country', 'sharedMemories'];

  showMore: boolean = false;
  truncatedDescription: string = '';
  characterLimit: number = 150;
  imagesWithMetadata: ImageWithMetadata[] = [];


  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private router: Router, private userService: UserService, public dialog: MatDialog, private locationService: LocationService, private imageDataService: ImageGalleryService) { }

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.memoryID = this.route.snapshot.params['id'];
    await this.getMemoryInfo();
  }

  private async getMemoryInfo(): Promise<void> {
    if (!this.loggedInUserId) return;

    try {
      const memoryData = await this.memoryService.getMemory(this.memoryID).toPromise();
      this.memorydb = memoryData;
      this.initializeMemoryDetails();
      
      const friendsData = await this.memoryService.getMemorysFriendsWithShared(this.memoryID, this.loggedInUserId).toPromise();
      this.memorydbFriends = friendsData.length ? friendsData : null;

      const memoryCreator = await this.userService.getUser(this.loggedInUserId).toPromise();
      if (memoryCreator.length !== 0) this.memoryCreator = memoryCreator;

    } catch (error) {
      console.error('Error fetching memory data:', error);
    }
  }

  private initializeMemoryDetails(): void {
    this.truncateDescription();
    this.selectedDate = new Date(this.memorydb.memory_date);
    this.endDate = new Date(this.memorydb.memory_end_date);
    this.dateRange = new DateRange(this.selectedDate, this.endDate);
    this.getImages(this.memorydb.image_url);
    this.fetchLocationData(this.memorydb.location_id);
  }

  private fetchLocationData(locationId: number): void {
    this.locationService.getLocationById(locationId).subscribe(
      (locationData) => {
        this.location = locationData.location_id === 1 ? null : locationData;
      },
      (error: Error) => console.error('Error fetching location data:', error)
    );
  }

  truncateDescription() {
    if (this.memorydb.text.length > this.characterLimit) {
      this.truncatedDescription = this.memorydb.text.substring(0, this.characterLimit) + '...';
      this.showMore = true;
    } else {
      this.truncatedDescription = this.memorydb.text;
    }
  }

  get displayImages(): ImageWithMetadata[] {
    const imagesToShow = [...this.imagesWithMetadata];
    while (imagesToShow.length < 5) {
      imagesToShow.push({ url: '../../../assets/img/placeholder_image.png', width: 0, height: 0 });
    }
    return imagesToShow;
  }

  private getImages(imageId: string): void {
    const storage = getStorage();
    const listRef = ref(storage, `memories/${imageId}`);

    listAll(listRef).then((res) => {
      res.items.forEach((itemRef) => {
        getDownloadURL(ref(storage, itemRef.fullPath))
          .then((url) => getMetadata(ref(storage, itemRef.fullPath)).then((metadata) => {
            this.imagesWithMetadata.push({
              url,
              width: parseInt(metadata.customMetadata?.['width'] || '0', 10),
              height: parseInt(metadata.customMetadata?.['height'] || '0', 10),
            });
          }))
          .catch((error) => console.error('Error fetching metadata or URL:', error));
      });
    }).catch((error) => console.error('Error listing items:', error));
  }

  openGallery() {
    this.imageDataService.updateImageData(this.imagesWithMetadata);
    this.router.navigate(['memory', this.memoryID, 'gallery']);
  }

  downloadZip(): void {
    const confirmationData: ConfirmationDialogData = {
      title: 'Download memories images?',
      message: 'With clicking "YES" you start the download of this memories images',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '450px', data: confirmationData });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        console.log("Start Download!");
      }
    });
  }

  openFullDescDialog(): void {
    this.dialog.open(FullDescriptionDialogComponent, { data: { description: this.memorydb.text } });
  }
}
