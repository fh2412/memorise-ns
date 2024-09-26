import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrl: 'image-gallery.component.scss'
})
export class ImageGalleryComponent {
  @Input() landscapePictures: string[] = ['https://th.bing.com/th/id/OIP.yLf7kQVaLpxqCZX1VRHw-wHaEK?rs=1&pid=ImgDetMain', 'https://th.bing.com/th/id/OIP.AzD6Bs6J9NX-XJtM_isBuwHaEo?rs=1&pid=ImgDetMain'];
  @Input() portraitPictures: string[] = ['https://th.bing.com/th/id/R.ec5b9430f51b488e2f93e79d19e07da6?rik=0Pmff4HYWKBdVQ&riu=http%3a%2f%2fmedia.idownloadblog.com%2fwp-content%2fuploads%2f2016%2f04%2fiPhone-wallpaper-abstract-portrait-gas-mask-macinmac-576x1024.jpg&ehk=uk68KRlfQ0sTKDT9YHdUV%2bNgH%2buuV9iMi0QrOvvgE74%3d&risl=&pid=ImgRaw&r=0', 'https://th.bing.com/th/id/R.005ca765038679e314b2df606eb1e0dd?rik=GMbM4vssQ4%2b7Eg&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f7%2f6%2f1%2f75011.jpg&ehk=86HIWnuMc25EJkyAVYlHu8Vey55cgBxmb09Xln8xmzM%3d&risl=&pid=ImgRaw&r=0', 'https://th.bing.com/th/id/OIP.7vEhpT4-RmdX3tz-BCnBqwHaNK?rs=1&pid=ImgDetMain', 'https://th.bing.com/th/id/OIP.nHA4rQ5odBfKUWaoe5Rf4wHaNK?rs=1&pid=ImgDetMain'];

  // Define layouts for different picture combinations
  private layouts = [
    { type: 'landscape', lcount: 1, pcount: 0 },
    { type: 'portrait', lcount: 0, pcount: 2 },
    { type: 'portrait-landscape', lcount: 2, pcount: 1 }
  ];

  // Create an array to store the combined pictures with layout information
  combinedPictures: { url: string; layout: string }[] = [];
  layout: { pics: string[]; layout: string }[] = [];

  ngOnInit() {
    this.combinePictures();
  }

  private combinePictures() {
    console.log("Count: ", this.landscapePictures.length + this.portraitPictures.length);
    // Iterate over the layouts
    for (const layout of this.layouts) {
      // Calculate the number of pictures needed for the current layout
      let lpics = layout.lcount;
      let ppics = layout.pcount;

      // Check if there are enough landscape or portrait pictures
      if (layout.lcount <= this.landscapePictures.length || layout.pcount <= this.portraitPictures.length) {
        // Create a new array to store the combined pictures for the current layout
        const combinedLayoutPictures: string[] = [];

        // Add pictures to the combined layout array
        for (let i = 0; i < lpics; i++) {
          combinedLayoutPictures.push(this.landscapePictures.shift()!);
        }
        for (let i = 0; i < ppics; i++) {
          combinedLayoutPictures.push(this.portraitPictures.shift()!);
        }
        // Add the combined layout pictures to the main array
        this.layout.push({ pics: combinedLayoutPictures, layout: layout.type });
      }
    }
    console.log(this.combinedPictures);
    console.log(this.landscapePictures, this.portraitPictures);

  }
}
