import { Component, Input } from '@angular/core';
import { MemoryService } from '../services/memory.service';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrl: './memory-card.component.scss'
})
export class MemoryCardComponent {
  @Input() cardData: any; // Assuming cardData is an object with properties like title and description
  titleUrl: any;
  
  constructor(private memoryService: MemoryService) {}

  /*ngOnInit() {
    this.getTitlePic;
  }
  async getTitlePic(): Promise<void>{
    this.titleUrl = await this.memoryService.getMemoryTitlePictureUrl(this.cardData.image_url);
  }*/
}
