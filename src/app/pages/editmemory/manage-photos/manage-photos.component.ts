import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getDownloadURL, getMetadata, getStorage, listAll, ref } from 'firebase/storage';
import { FileUploadService } from '../../../services/file-upload.service';
import { MemoryService } from '../../../services/memory.service';

@Component({
  selector: 'app-manage-photos',
  templateUrl: './manage-photos.component.html',
  styleUrl: './manage-photos.component.scss'
})
export class ManagePhotosComponent {
  imagesToDelete: string[] = [];
  imageUrl: string | null = null;

  images: { url: string; isStarred: boolean }[] = []; // Array of image objects
  starredIndex: number | null = null;  // To store the index of the starred image
  hoverIndex: number | null = null;

  constructor(private route: ActivatedRoute, private fileService: FileUploadService, private router: Router, private memoryService: MemoryService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.imageUrl = params.get('imageUrl');
    });
    this.getImages(this.imageUrl);
  }


  onStar(index: number) {
    if(this.starredIndex != null){
      this.fileService.starImage(index, this.starredIndex, this.images[this.starredIndex].url, this.images[index].url);
      this.memoryService.updateTitlePic(this.imageUrl, this.images[index].url).subscribe();
      this.starredIndex = index;
    }
  }
  

  onDelete(imageUrl: string) {
    // Find the image object based on the imageUrl
    const imageToDelete = this.images.find(item => item.url === imageUrl);
    
    if (imageToDelete) {
      // Push the image URL to the array of images to delete
      this.imagesToDelete.push(imageToDelete.url);
  
      // Filter out the deleted image from the images array
      this.images = this.images.filter(item => item.url !== imageUrl);
  
      // Optional: If the deleted image was starred, reset starredIndex
      if (this.starredIndex !== null && this.images[this.starredIndex]?.url === imageUrl) {
        this.starredIndex = null; // Reset the starred image if it was deleted
      }
    }
  }

  removeFromDeleteList(imageUrl: string) {
    // Find the image object based on the imageUrl in the delete list
    const imageToRestore = this.imagesToDelete.find(item => item === imageUrl);
  
    if (imageToRestore) {
      // Push the full image object back to the images array
      const restoredImage = { url: imageUrl, isStarred: false, path: '' }; // Adjust properties if needed
      this.images.push(restoredImage);
  
      // Remove the image from the imagesToDelete array
      this.imagesToDelete = this.imagesToDelete.filter(item => item !== imageUrl);
    }
  }  

  getImages(imageid: any) {
    const storage = getStorage();
  
    // Create a reference under which you want to list
    const listRef = ref(storage, `memories/${imageid}`);
  
    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.items.forEach((itemRef) => {
          // Get the download URL and metadata
          const imageRef = ref(storage, itemRef.fullPath);
          getDownloadURL(imageRef).then((url) => {
            // Fetch metadata including isStarred
            getMetadata(imageRef).then((metadata) => {
              const isStarred = metadata.customMetadata?.['isStarred'] === 'true';
  
              // Push the image URL and the isStarred flag
              this.images.push({ url, isStarred });
              
              // Automatically set the starred index if this image is starred
              if (isStarred) {
                this.starredIndex = this.images.length - 1; // Set to the correct index
              }
            });
          }).catch((error) => {
            console.log(error);
          });
        });
      }).catch((error) => {
        console.log(error);
      });
  }
  

  deleteImages(){
    this.fileService.deleteImages(this.imagesToDelete);
    this.imagesToDelete=[];
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
