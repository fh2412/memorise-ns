import { Component, HostListener, OnInit } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { LocationService } from '../../services/location.service';
import { InfoDialogComponent, InfoDialogData } from '../../components/_dialogs/info-dialog/info-dialog.component';
import { ConfirmDialogComponent } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../services/userService';
import { PinnedMemoryService } from '../../services/pinnedMemorService';
import { Memory } from '../../models/memoryInterface.model';
import { Friend } from '../../models/userInterface.model';
import { MemoriseLocation } from '../../models/location.model';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-editmemory',
    templateUrl: './editmemory.component.html',
    styleUrl: './editmemory.component.scss',
    standalone: false
})
export class EditmemoryComponent implements OnInit {
  loggedInUserId: string | null = null;
  memoryId = '';
  memory!: Memory;

  friends: Friend[] = [];
  friendsToAdd: string[] = [];
  friendsToDelete: Friend[] = [];

  location!: MemoriseLocation;

  firebaseId = '';
  memoryForm: FormGroup;

  displayedColumns: string[] = ['profilePicture', 'name', 'birthday', 'country', 'sharedMemories'];

  isLargeScreen = true;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.isLargeScreen = window.innerWidth > 1500;
  }

  constructor(
    private formBuilder: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute, 
    private userService: UserService, 
    private memoryService: MemoryService, 
    private locationService: LocationService, 
    private pinnedService: PinnedMemoryService,
    private firebaseService: FileUploadService, 
    private dialog: MatDialog
  ) {
    this.memoryForm = this.initializeMemoryForm();
  }

  async ngOnInit(): Promise<void> {
    this.onResize();
    this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
    this.memoryId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadMemoryData();
  }

  initializeMemoryForm(): FormGroup {
    return this.formBuilder.group({
      description: [''],
      title: [''],
      memory_date: [''],
      memory_end_date: [''],
      lng: [''],
      lat: [''],
      l_country: [''],
      l_city: [''],
      l_postcode: [''],
    });
  }

  async loadMemoryData(): Promise<void> {
    await Promise.all([this.loadMemory(), this.loadFriends()]);
  }

  loadMemory(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.memoryService.getMemory(Number(this.memoryId)).subscribe(
        response => {
          this.memory = response;
          this.firebaseId = response.image_url;
          this.memoryForm.patchValue({
            description: response.text,
            title: response.title,
            memory_date: response.memory_date,
            memory_end_date: response.memory_end_date
          });
          resolve();
        },
        error => {
          console.error('Error getting memory:', error);
          reject(error);
        }
      );
    });
  }

  loadFriends(): Promise<void> {
    return new Promise((resolve, reject) => {
      if(this.loggedInUserId != null){
        this.memoryService.getMemorysFriends(this.memoryId, this.loggedInUserId).subscribe(
          response => {
            this.friends = response;
            resolve();
          },
          error => {
            console.error('Error getting friends:', error);
            reject(error);
          }
        );
      }
    });  
  }

  loadLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.locationService.getLocationById(this.memory.location_id).subscribe(
        response => {
          this.location = response;
          resolve();
        },
        error => {
          console.error('Error getting location:', error);
          reject(error);
        }
      );
    });
  }

  async deleteMemory(favourite: boolean): Promise<void> {
    try {
      if(favourite){
        await firstValueFrom(this.pinnedService.deleteMemoryFromAllPins(Number(this.memoryId)));
      }
      await firstValueFrom(this.memoryService.deleteMemoryAndFriends(this.memoryId));
      await firstValueFrom(this.firebaseService.deleteMemorysFolder(this.firebaseId));
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error deleting memory and friends:', error);
    }
  }

  async saveChanges(): Promise<void> {
    try {
      if(this.memoryForm.value.memory_end_date == null){
        this.memoryForm.value.memory_end_date = this.memoryForm.value.memory_date;
      }
      await firstValueFrom(this.memoryService.updateMemory(this.memoryId, this.memoryForm.value));
      if (this.friendsToAdd.length > 0 || this.friendsToDelete.length > 0) {
        await this.updateFriends();
      }
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  }

  async updateFriends(): Promise<void> {
    if (this.friendsToAdd.length > 0) {
      await firstValueFrom(this.memoryService.addFriendToMemory({ emails: this.friendsToAdd, memoryId: this.memoryId }));
      this.reloadPage();
    }
    
    if (this.friendsToDelete.length > 0) {
      await Promise.all(this.friendsToDelete.map(friend => 
        firstValueFrom(this.memoryService.deleteFriendsFromMemory(friend.user_id, this.memoryId))
      ));
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  onSelectedValuesChange(selectedValues: string[]) {
    this.friendsToAdd = selectedValues.map(str => str.match(/\(([^)]+)\)/)?.[1] || null).filter(email => email !== null);
  }

  removeFriend(user: Friend) {
    // Remove the friend from the "friends" array
    const index = this.friends.indexOf(user);
    if (index > -1) {
      this.friends.splice(index, 1);
      this.friends = [...this.friends]; // Trigger change detection by reassigning the array
      // Add the friend to the "friendsToDelete" array
      this.friendsToDelete.push(user);
    }
  }
  
  reverseDelete(user: Friend) {
    const index = this.friendsToDelete.indexOf(user);
    if (index > -1) {
      this.friendsToDelete.splice(index, 1);
      this.friendsToDelete = [...this.friendsToDelete];
      // Add the friend to the "friendsToDelete" array
      this.friends.push(user);
      this.friends = [...this.friends];
    }
  }

  navigateToAddPhotos(): void {
    this.router.navigateByUrl(`${this.router.url}/addphotos`);
  }

  navigateToManagePhotos(): void {
    this.router.navigate(['/editmemory/managephotos', this.memory.image_url]);
  }

  initialiseMapDialog(): void {
    if (this.memory.location_id) {
      // Load location and then open the map dialog
      this.loadLocationAndOpenDialog();
    } else {
      // Open the map dialog with the default mapCenter
      this.openMapDialog(0, 0);
    }
  }

  private loadLocationAndOpenDialog(): void {
    this.loadLocation().then(() => {
      // Open dialog after successfully loading the location
      this.openMapDialog(this.location.latitude, this.location.longitude);
    }).catch(error => {
      console.error('Error loading location:', error);
      // Optionally handle error, e.g., show an alert or fallback
    });
  }
  
  private openMapDialog(lat: number, long: number): void {
    const dialogRef = this.dialog.open(ChooseLocationComponent, {
      data: { lat: Number(lat), long: Number(long) },
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateLocationData(result.formattedAddress, result.markerPosition);
      }
    });
  }

  updateLocationData(formattedAddress: string, coordinates: { lat: number; lng: number }): void {
    const addressComponents = this.locationService.parseFormattedAddress(formattedAddress);
  
    this.memoryForm.patchValue({
      l_city: addressComponents.city,
      l_postcode: addressComponents.postalCode,
      l_country: addressComponents.country,
      lat: coordinates.lat,
      lng: coordinates.lng,
    });
  
    if(this.memory.location_id === 1){
      this.createLocation();
    }
    else{
      this.updateLocation();
    }
  }
  

  openInfoDialog() {
    const dialogData: InfoDialogData = {
      text: 'Location got sucessfully updated!',
      buttonText: 'Ok'
    };

    this.dialog.open(InfoDialogComponent, {
      width: '400px',
      data: dialogData,
    });
  }

  createLocation(): void {
    this.locationService.createLocation(this.memoryForm.value).subscribe(
      response => this.memoryService.updateMemoryLocation(this.memory.memory_id, response.locationId).subscribe(),
      error => console.error('Error creating Location:', error)
    );
  }

  updateLocation(): void {
    this.locationService.updateLocation(this.memory.location_id, this.memoryForm.value)
      .subscribe(response => console.log('Location updated:', response), 
      error => console.error('Error updating location:', error));
  }

  async confirmDeletion(status: string): Promise<void> {
    const confirmed = await this.openConfirmationDialog('Confirm ' + status, `Are you sure you want to ${status} this memory?`);
    if (confirmed && status === 'DELETE') {
      this.pinnedService.checkMemoryPin(this.memory.memory_id).subscribe(
        async response => {
          if (response.length === 0) {
            await this.deleteMemory(false);
          } else {
            const deleteConfirmed = await this.openConfirmationDialog('Delete anyways?', 'This memory is in someone\'s Favorite Memories. Delete anyway?');
            if (deleteConfirmed) await this.deleteMemory(true);
          }
        },
        error => console.error('Error checking pinned memory:', error)
      );
    }
  }

  openConfirmationDialog(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: { title, message }
    });
    return firstValueFrom(dialogRef.afterClosed());
  }
}
