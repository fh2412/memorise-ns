import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/userService';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../../components/_dialogs/image-dialog/image-dialog.component';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { DateRange } from '@angular/material/datepicker';
import { LocationService } from '../../services/location.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FullDescriptionDialogComponent } from '../../components/_dialogs/full-description-dialog/full-description-dialog.component';


@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: 'memory-detail.component.scss'
})
export class MemoryDetailComponent {
  memorydb: any;
  memoryID: any;
  memoryCreator: any;
  loggedInUserId: string | any;
  memorydbFriends: any;
  selectedDate = new Date(2024, 1, 1);
  endDate = new Date(2024, 1, 1);
  dateRange: any;
  location: any;

  displayedColumns: string[] = ['profilePicture', 'name', 'birthday', 'country', 'sharedMemories'];  
  
  images: string[] = [];
  previewImages: string[] = [];


  uniqueID: string = "your-unique-id";
  downloadURLs: any;
  imagePaths: any;

  showMore: boolean = false;
  truncatedDescription: string = '';
  characterLimit: number = 150;


  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private router: Router, private userService: UserService, public dialog: MatDialog, private locationService: LocationService, private bottomSheet: MatBottomSheet) {}

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.route.params.subscribe(params => {
      this.memoryID = params['id'];
    });
    await this.getMemoryInfo();
  }

  getMemoryInfo(): void {
    const memoryObs = this.memoryService.getMemory(this.memoryID);
    const friendsObs = this.memoryService.getMemorysFriends(this.memoryID, this.loggedInUserId);
    const memoryCreatorObs = this.userService.getUser(this.loggedInUserId);

  
    memoryObs.subscribe(
      (memoryData) => {
        this.memorydb = memoryData;
        this.truncateDescription();
        this.selectedDate = new Date(this.memorydb.memory_date);
        this.endDate = new Date(this.memorydb.memory_end_date);
        this.dateRange = new DateRange(this.selectedDate, this.endDate);
        this.getImages(this.memorydb.image_url);
        const locationObs = this.locationService.getLocationById(this.memorydb.location_id);
        locationObs.subscribe(
          (locationData) => {
          if (locationData.length === 0) {
            this.location = null;
          } else {
            this.location = locationData;
          }
        },
        (error: any) => {
          console.error('Error fetching friends data:', error);
          // Set an error message or handle the error as needed
          this.memorydbFriends = 'Error fetching friends data';
        }
        )
      },
      (error: any) => {
        console.error('Error fetching memory data:', error);
      }
    );
  
    friendsObs.subscribe(
      (friendsData) => {
        if (friendsData.length === 0) {
          // Set a default value when there are no friends
          this.memorydbFriends = 'There are no friends added to the memory yet!';
        } else {
          this.memorydbFriends = friendsData;
          console.log(this.memorydbFriends);
        }
      },
      (error: any) => {
        console.error('Error fetching friends data:', error);
        // Set an error message or handle the error as needed
        this.memorydbFriends = 'Error fetching friends data';
      }
    );

    memoryCreatorObs.subscribe(
      (userData) => {
        if (userData.length === 0) {
          this.memoryCreator = 'There is no creator for this memory';
        } else {
          this.memoryCreator = userData;
        }
      },
      (error: any) => {
        console.error('Error fetching memories creator:', error);
      }
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
  
  openImageDialog(imageSrc: string, index: number): void {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '80vw',
      data: { images: this.images, initialIndex: index },
      panelClass: 'custom-dialog-container'
    });
  }
  
  getImages(imageid: any) {
    const storage = getStorage();
  
    // Create a reference under which you want to list
    const listRef = ref(storage, `memories/${imageid}`);
  
    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.items.forEach((itemRef) => {
          getDownloadURL(ref(storage, itemRef.fullPath))
            .then((url) => {
              this.images.push(url); // Keep all the URLs for later usage
              this.updatePreviewImages(); // Update preview every time a new image is added
            })
            .catch((error) => {
              // Handle any errors
            });
        });
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
      });
  }
  
  updatePreviewImages() {
    // Fill previewImages with the first 5 images from 'images'
    this.previewImages = this.images.slice(0, 5);
  
    // If less than 5 images, fill the rest with the placeholder
    while (this.previewImages.length < 5) {
      this.previewImages.push('../../../assets/img/placeholder_image.png');
    }
  }
  
  

  openGallery() {
    this.router.navigate(['memory/', this.memoryID, 'gallery']);
  }
  openFullDescDialog() {
    this.dialog.open(FullDescriptionDialogComponent, {
      data: {
        description: this.memorydb.text
      }
    });
  }
}
