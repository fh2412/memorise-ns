import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { MemoryAddPhotosComponent } from '@components/memory-add-photos/memory-add-photos.component';

@Component({
  selector: 'app-add-photos',
  templateUrl: './add-photos.component.html',
  styleUrls: ['./add-photos.component.scss'],
  imports: [BackButtonComponent, MemoryAddPhotosComponent]
})
export class AddPhotosComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);

  memoryId = 1;

  async ngOnInit(): Promise<void> {
    this.activatedRoute.params.subscribe(params => {
      this.memoryId = +params['id'] || this.memoryId;
    });
  }
}
