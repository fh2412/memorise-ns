import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/userService';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../../components/_dialogs/image-dialog/image-dialog.component';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { DateRange } from '@angular/material/datepicker';
import { LocationService } from '../../services/location.service';


@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: './memory-detail.component.scss'
})
export class MemoryDetailComponent {
  memorydb: any;
  memoryID: any;
  loggedInUserId: string | any;
  memorydbFriends: any;
  selectedDate = new Date(2024, 1, 1);
  endDate = new Date(2024, 1, 1);
  dateRange: any;
  location: any;

  
  images: string[] = [];

  uniqueID: string = "your-unique-id";
  downloadURLs: any;
  imagePaths: any;


  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private userService: UserService, public dialog: MatDialog, private locationService: LocationService) {}

  ngOnInit(): void {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.route.params.subscribe(params => {
      this.memoryID = params['id'];
    });
    this.getMemoryInfo();
  }

  getMemoryInfo(): void {
    const memoryObs = this.memoryService.getMemory(this.memoryID);
    const friendsObs = this.memoryService.getMemorysFriends(this.memoryID, this.loggedInUserId);
  
    memoryObs.subscribe(
      (memoryData) => {
        this.memorydb = memoryData;
        this.selectedDate = new Date(this.memorydb.memory_date);
        this.endDate = new Date(this.memorydb.memory_end_date);
        this.dateRange = new DateRange(this.selectedDate, this.endDate);
        this.getImages(this.memorydb.image_url);
        const locationObs = this.locationService.getLocationById(this.memorydb.location_id);
        locationObs.subscribe(
          (locationData) => {
          if (locationData.length === 0) {
            // Set a default value when there are no friends
            this.location = null;
          } else {
            this.location = locationData;
            console.log(this.location);
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
        res.prefixes.forEach((folderRef) => {
          console.log(folderRef);
        });
        res.items.forEach((itemRef) => {
          getDownloadURL(ref(storage, itemRef.fullPath))
            .then((url) => {
              this.images.push(url);
            })
            .catch((error) => {
              // Handle any errors
            });
        });
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
  }

  private generateDateRange(start: Date, end: Date): Date[] {
    const dateRange: Date[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
  }

}
