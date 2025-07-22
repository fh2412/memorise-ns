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
  userId: string;
}


@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: 'memory-detail.component.scss',
  standalone: false
})
export class MemoryDetailComponent implements OnInit {
  memorydb!: Memory;
  memoryId = 0;
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
  isLoadingImages = true;
  hasPrivileges = false;

  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private router: Router, private userService: UserService, public dialog: MatDialog, private locationService: LocationService, private imageDataService: ImageGalleryService, private activityService: ActivityService) { }

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.memoryId = this.route.snapshot.params['id'];
    await this.getUsersPermissions();
    await this.getMemoryInfo();
  }

  private async getUsersPermissions(): Promise<void> {
    if(this.loggedInUserId){
      this.hasPrivileges = await this.memoryService.checkMemoriseUserPermission(this.memoryId.toString(), this.loggedInUserId);
    }
  }

  private async getMemoryInfo(): Promise<void> {
    if (!this.loggedInUserId) return;

    try {
      const memoryData = await firstValueFrom(this.memoryService.getMemory(this.memoryId));
      this.memorydb = memoryData;

      await this.initializeMemoryDetails();
      const activityData = await firstValueFrom(this.activityService.getActivityDetails(this.memorydb.activity_id));
      this.activity = activityData.title;

      const friendsData = await firstValueFrom(this.memoryService.getMemorysFriendsWithShared(this.memoryId, this.loggedInUserId));
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
    imagesToShow.push({
      url: '../../../assets/img/placeholder_image.png',
      width: 0,
      height: 0,
      created: 'placeholder',
      size: 0,
      userId: '',
    });
  }
  return imagesToShow.slice(0, 5); // Ensure it's always 5 items
}


private getImages(imageId: string): void {
  const storage = getStorage();
  const listRef = ref(storage, `memories/${imageId}`);
  this.isLoadingImages = true;
  this.imagesWithMetadata = [];

  listAll(listRef).then((res) => {
    const fetchPromises = res.items.map((itemRef) => {
      const fullRef = ref(storage, itemRef.fullPath);
      return getDownloadURL(fullRef).then((url) =>
        getMetadata(fullRef).then((metadata) => ({
          url,
          width: parseInt(metadata.customMetadata?.['width'] || '0', 10),
          height: parseInt(metadata.customMetadata?.['height'] || '0', 10),
          created: metadata.timeCreated,
          size: metadata.size,
          userId: metadata.customMetadata?.['userId'] || '',
        }))
      );
    });

    Promise.all(fetchPromises).then((images) => {
      this.imagesWithMetadata = images;
      this.isLoadingImages = false;
    });
  }).catch((error) => {
    console.error('Error listing items:', error);
    this.isLoadingImages = false;
  });
}


  openGallery() {
    this.imageDataService.updateImageData(this.imagesWithMetadata);
    this.router.navigate(['memory', this.memoryId, 'gallery']);
  }

  openDownloadPage(): void {
    this.imageDataService.updateImageData(this.imagesWithMetadata);
    this.router.navigate(['memory', this.memoryId, 'download'], {
      state: { memory: this.memorydb }
    });
  }

  openFullDescDialog(): void {
    this.dialog.open(FullDescriptionDialogComponent, { data: { description: this.memorydb.text } });
  }
}
