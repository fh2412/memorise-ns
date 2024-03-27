import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getDownloadURL, getMetadata, getStorage, listAll, ref, updateMetadata } from 'firebase/storage';
import { FileUploadService } from '../../../services/file-upload.service';

@Component({
  selector: 'app-manage-photos',
  templateUrl: './manage-photos.component.html',
  styleUrl: './manage-photos.component.scss'
})
export class ManagePhotosComponent {
  images: string[] = [];
  imagesToDelete: string[] = [];
  imageUrl: string | null | undefined;

  constructor(private route: ActivatedRoute, private fileService: FileUploadService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.imageUrl = params.get('imageUrl');
    });
    this.getImages(this.imageUrl);
  }


  onStar(imageUrl: string) {
    // Add logic to handle starring an image here
    const storage = getStorage();
    console.log("storage:", storage);
    const forestRef = ref(storage, imageUrl);
    const newMetadata = {
      cacheControl: 'public,max-age=300',
      contentType: 'image/jpeg',
      customElements: {
        'fav' : true,
      }
    };
        updateMetadata(forestRef, newMetadata)
      .then((metadata) => {
        console.log(metadata)
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
  }

  onDelete(imageUrl: string) {
    // Add logic to handle deleting an image here
    this.imagesToDelete.push(imageUrl);
    this.images = this.images.filter(item => item !== imageUrl);
  }

  removeFromDeleteList(imageUrl: string){
    this.images.push(imageUrl);
    this.imagesToDelete = this.imagesToDelete.filter(item => item !== imageUrl);
  }

  getImages(imageid: any) {
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, `memories/${imageid}`);
    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        console.log("res", res);
        res.prefixes.forEach((folderRef) => {
          console.log(folderRef);
        });
        res.items.forEach((itemRef) => {
          getDownloadURL(ref(storage, itemRef.fullPath))
            .then((url) => {
              this.images.push(url);
            })
            .catch((error) => {
              console.log(error);
            });
        });
      }).catch((error) => {
        console.log(error);
      });
  }

  deleteImages(){
    this.fileService.deleteImages(this.imagesToDelete)
  }
}
