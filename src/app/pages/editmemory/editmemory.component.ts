import { Component } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { LocationService } from '../../services/location.service';
import { InfoDialogComponent, InfoDialogData } from '../../components/_dialogs/info-dialog/info-dialog.component';
import { ConfirmDialogComponent, ConfirmationDialogData } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-editmemory',
  templateUrl: './editmemory.component.html',
  styleUrl: './editmemory.component.scss'
})
export class EditmemoryComponent {
  loggedInUserId: any;
  memoryId: string = '';
  memory: any;
  friends: any;
  friendsToDelete: any[] = [];
  firebaseId: string = '';
  memoryForm: FormGroup;
  isFormChanged: boolean = true;
  emailArray: any;
  newFriends: boolean = true;
  parentSelectedFiles: File[] = [];

  displayedColumns: string[] = ['profilePicture', 'name', 'birthday', 'country', 'sharedMemories'];

  constructor(private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute, private userService: UserService,private memoryService: MemoryService, private locationService: LocationService, private firebaseService: FileUploadService, private dialog: MatDialog) {
    this.memoryForm = this.formBuilder.group({
      description: [''],
      title: [''],
      memory_date: [''],
      memory_end_date: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    this.loggedInUserId = await this.userService.getLoggedInUserId();

    this.route.paramMap.subscribe((params) => {
      this.memoryId = params.get('id')!;
    });
    await this.getMemory();
    await this.getFriends();
    //this.memoryForm.valueChanges.subscribe(() => {
    //  this.isFormChanged = true;
    //});
  }

  async deleteMemory() {
    await this.memoryService.deleteMemoryAndFriends(this.memoryId).subscribe(
      (response) => {
        this.firebaseService.deleteMemorysFolder(this.firebaseId)
        .subscribe(
          () => {
            this.router.navigate(['/home']);
          },
          (error) => {
            console.error('Error deleting folder:', error);
          }
        );
      },
      (error) => {
        console.error('Error deleting memory and friends:', error);
        // Handle error, e.g., show an error message
      }
    );
  }

  getMemory() {
    this.memoryService.getMemory(this.memoryId).subscribe(
      (response) => {
        this.firebaseId = response.image_url;
        this.memory = response;
        this.memoryForm.patchValue({
          description: this.memory.text,
          title: this.memory.title,
          memory_date: this.memory.memory_date,
          memory_end_date: this.memory.memory_end_date
        });
      },
      (error) => {
        console.error('Error getting memory:', error);
      }
    );
  }

  getFriends() {
    this.memoryService.getMemorysFriends(this.memoryId, this.loggedInUserId).subscribe(
      (response) => {
        this.friends=response;
        console.log("Friends: ", this.friends);
      },
      (error) => {
        console.error('Error getting memory:', error);
      }
    );
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  saveChanges(): void {
    this.memoryService.updateMemory(this.memoryId, this.memoryForm.value).subscribe(
      (response) => {
        console.log(response); // Handle success response
      },
      (error) => {
        console.error('Error updating memory:', error); // Handle error
      }
    );
    this.router.navigate(['/home']);
  }

  onSelectedValuesChange(selectedValues: string[]) {
    this.emailArray = selectedValues.map(str => str.match(/\(([^)]+)\)/)?.[1] || null).filter(email => email !== null);
    if(this.emailArray.length>0){
      this.newFriends=false;
    }
    else{
      this.newFriends=true;
    }
  }


  async addFriends(): Promise<void>{
    const friendData = { emails: this.emailArray, memoryId: this.memoryId };
    await this.memoryService.addFriendToMemory(friendData).subscribe(
      (friendResponse) => {
        console.log('Friend added to memory successfully:', friendResponse);
        window.location.reload();
      },
      (friendError) => {
        console.error('Error adding friend to memory:', friendError);
        // Handle error (e.g., show an error message to the user)
      }
    );
  }

  removeFriend(user: any) {
    // Remove the friend from the "friends" array
    const index = this.friends.indexOf(user);
    if (index > -1) {
      this.friends.splice(index, 1);
      // Add the friend to the "friendsToDelete" array
      this.friendsToDelete.push(user);
    }
  }
  reverseDelete(user: any) {
    const index = this.friendsToDelete.indexOf(user);
    if (index > -1) {
      this.friendsToDelete.splice(index, 1);
      // Add the friend to the "friendsToDelete" array
      this.friends.push(user);
    }
  }

  onSelectedFilesChange(files: File[]) {
    this.parentSelectedFiles = files;
    // Do whatever you need with the selected files in the parent component
  }

  addPhotos(){
    const currentUrl = this.router.url;
    const newUrl = currentUrl + '/addphotos';
    this.router.navigateByUrl(newUrl);
  }

  managePhotos(){
    this.router.navigate(['/editmemory/managephotos', this.memory.image_url]);
  }

  mapCenter: google.maps.LatLng= new google.maps.LatLng(47.5, 14.2);
  openMapDialog(): void {
    const dialogRef = this.dialog.open(ChooseLocationComponent, {
      data: { mapCenter: this.mapCenter },
      width: '500px',
      height: '542px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.openInfoDialog();
      if (result) {
        if(this.memory.location_id == 1){
          this.create_location(result[1]);
        }
        else{
          this.updateLocation(result[1]);
        }
      }
    });
  }

  openInfoDialog() {
    console.log("OPEN DIALOG");
    const dialogData: InfoDialogData = {
      text: 'Location got sucessfully updated!',
      buttonText: 'Ok'
    };

    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '250px',
      data: dialogData,
    });
  }

  create_location(locationData: any){
    this.locationService.createLocation(locationData).subscribe(
      (response: { message: string, locationId: any }) => {
        const location_id = response.locationId[0]?.insertId;
        this.memoryService.updateMemoryLocation(this.memory.memory_id, location_id).subscribe(
          (response) => {
            console.log(response);
          },
          (error) => {
            console.error('Error creating Location:', error);
          }
        );
      },
      (locationResponse) => {
        console.error('Error creating Location:', locationResponse);
      }
    );
  }

  updateLocation(locationData: any) {
    this.locationService.updateLocation(this.memory.location_id, locationData)
      .subscribe(response => {
        console.log('Location updated:', response);
        // Handle successful update (e.g., display a success message)
      }, error => {
        console.error('Error updating location:', error);
        // Handle errors (e.g., display an error message)
      });
  }

  onDeleteClick(status: string) {
    const confirmationData: ConfirmationDialogData = {
      title: 'Confirm '+status,
      message: 'Are you sure you want to '+status+' this memory?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: confirmationData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        if(status==='DELETE'){
          this.deleteMemory();
        }
        else{
          this.goToHome();
        }
      }
    });
  }
}
