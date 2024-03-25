import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getDownloadURL, getStorage, listAll, ref } from 'firebase/storage';

@Component({
  selector: 'app-manage-photos',
  templateUrl: './manage-photos.component.html',
  styleUrl: './manage-photos.component.scss'
})
export class ManagePhotosComponent {
  images: string[] = [];
  imageUrl: string | null | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.imageUrl = params.get('imageUrl');
    });
    this.getImages(this.imageUrl);
  }


  onStar(imageUrl: string) {
    // Add logic to handle starring an image here
    console.log('Starred image: ', imageUrl);
  }

  onDelete(imageUrl: string) {
    // Add logic to handle deleting an image here
    console.log('Deleted image: ', imageUrl);
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
}
