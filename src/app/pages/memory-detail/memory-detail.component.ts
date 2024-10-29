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

  showMore: boolean = false;
  truncatedDescription: string = '';
  characterLimit: number = 150;
  imagesWithMetadata: ImageWithMetadata[] = [];


  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private router: Router, private userService: UserService, public dialog: MatDialog, private locationService: LocationService, private imageDataService: ImageGalleryService) { }

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.route.params.subscribe(params => {
      this.memoryID = params['id'];
    });
    await this.getMemoryInfo();
  }

  getMemoryInfo(): void {
    const memoryObs = this.memoryService.getMemory(this.memoryID);
    const friendsObs = this.memoryService.getMemorysFriendsWithShared(this.memoryID, this.loggedInUserId);
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
          this.memorydbFriends = 1;
          console.log("Friends: ", this.memorydbFriends);

        } else {
          this.memorydbFriends = friendsData;
          console.log("Friends: ", this.memorydbFriends);
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

  get displayImages() {
    const imagesToShow = [...this.imagesWithMetadata];
    // Add placeholder entries until the array has exactly 5 items
    while (imagesToShow.length < 5) {
      imagesToShow.push({
        url: '../../../assets/img/placeholder_image.png',
        width: 0,
        height: 0
      });
    }
    return imagesToShow;
  }

  getImages(imageid: any) {
    const storage = getStorage();
    const listRef = ref(storage, `memories/${imageid}`);

    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.items.map((itemRef) =>
          // First, get the download URL
          getDownloadURL(ref(storage, itemRef.fullPath))
            .then((url) => {
              // Then, get the metadata for dimensions
              return getMetadata(ref(storage, itemRef.fullPath)).then((metadata) => {
                const width = parseInt(metadata.customMetadata?.['width'] || '0', 10);
                const height = parseInt(metadata.customMetadata?.['height'] || '0', 10);

                // Push both URL and dimensions into the object array
                this.imagesWithMetadata.push({
                  url: url,
                  width: width,
                  height: height
                });
              });
            })
            .catch((error) => {
              console.error('Error fetching metadata or URL:', error);
            })
        );
      })
      .catch((error) => {
        console.error('Error listing items:', error);
      });
  }

  openGallery() {
    this.imageDataService.updateImageData(this.imagesWithMetadata);
    this.router.navigate(
      ['memory', this.memoryID, 'gallery']
    );
  }

  openDownload() {
    this.router.navigate(
      ['memory', this.memoryID, 'download']
    );
  }

  openFullDescDialog() {
    this.dialog.open(FullDescriptionDialogComponent, {
      data: {
        description: this.memorydb.text
      }
    });
  }
}
