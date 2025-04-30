import { Component, OnInit } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/userService';
import { MatDialog } from '@angular/material/dialog';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "@angular/fire/storage";
import { DateRange } from '@angular/material/datepicker';
import { LocationService } from '../../services/location.service';
import { FullDescriptionDialogComponent } from '../../components/_dialogs/full-description-dialog/full-description-dialog.component';
import { ImageGalleryService } from '../../services/image-gallery.service';
import { Memory } from '../../models/memoryInterface.model';
import { Friend, MemoriseUser } from '../../models/userInterface.model';
import { MemoriseLocation } from '../../models/location.model';
import { ActivityService } from '../../services/activity.service';
import { firstValueFrom } from 'rxjs';


export interface ImageWithMetadata {
  url: string;
  width: number;
  height: number;
  created: string;
  size: number;
}


@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: 'memory-detail.component.scss',
  standalone: false
})
export class MemoryDetailComponent implements OnInit {
  memorydb!: Memory;
  memoryID = 0;
  memoryCreator!: MemoriseUser;
  loggedInUserId: string | null = null;
  memorydbFriends: Friend[] | null = [];
  selectedDate = new Date(2024, 1, 1);
  endDate = new Date(2024, 1, 1);
  dateRange!: DateRange<Date>;
  location: MemoriseLocation | null = null;
  activity = 'Activity';

  displayedColumns: string[] = ['profilePicture', 'name', 'birthday', 'country', 'sharedMemories'];

  showMore = false;
  truncatedDescription = '';
  characterLimit = 150;
  imagesWithMetadata: ImageWithMetadata[] = [];


  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private router: Router, private userService: UserService, public dialog: MatDialog, private locationService: LocationService, private imageDataService: ImageGalleryService, private activityService: ActivityService) { }

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.memoryID = this.route.snapshot.params['id'];
    await this.getMemoryInfo();
  }

  private async getMemoryInfo(): Promise<void> {
    if (!this.loggedInUserId) return;

    try {
      const memoryData = await firstValueFrom(this.memoryService.getMemory(this.memoryID));
      this.memorydb = memoryData;

      //await this.initializeMemoryDetails();
      //const activityData = await firstValueFrom(this.activityService.getActivity(this.memorydb.activity_id));
      //this.activity = activityData.title;

      //TODO FIX ACTIVITY ROUTE

      const friendsData = await firstValueFrom(this.memoryService.getMemorysFriendsWithShared(this.memoryID, this.loggedInUserId));
      this.memorydbFriends = friendsData.length ? friendsData : null;

      const memoryCreator = await firstValueFrom(this.userService.getUser(this.memorydb.user_id.toString()));
      this.memoryCreator = memoryCreator;

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
      imagesToShow.push({ url: '../../../assets/img/placeholder_image.png', width: 0, height: 0, created: 'new Date', size: 0 });
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
              created: metadata.timeCreated,
              size: metadata.size,
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

  openDownloadPage(): void {
    this.imageDataService.updateImageData(this.imagesWithMetadata);
    this.router.navigate(['memory', this.memoryID, 'download'], {
      state: { memory: this.memorydb }
    });
  }

  openFullDescDialog(): void {
    this.dialog.open(FullDescriptionDialogComponent, { data: { description: this.memorydb.text } });
  }
}
