import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/userService';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../../components/_dialogs/image-dialog/image-dialog.component';

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
  selectedDate = new Date(2024, 1, 1); // Set your specific date here
  
  images = [
    'https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
    'https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg',
    'https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
    'https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg',
  ];

  constructor(private memoryService: MemoryService, private route: ActivatedRoute, private userService: UserService, public dialog: MatDialog) {}

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
  
  openImageDialog(imageSrc: string): void {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      this.dialog.open(ImageDialogComponent, {
        width: img.width + 'px',
        height: img.height + 'px',
        maxWidth: '80vw',
        maxHeight: '80vw',
        data: { imageSrc },
      });
    };
  }
  
  
}
