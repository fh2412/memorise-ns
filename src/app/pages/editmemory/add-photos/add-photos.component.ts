import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BackButtonComponent } from '@components/back-button/back-button.component';
import { MemoryAddPhotosComponent } from '@components/memory-add-photos/memory-add-photos.component';

@Component({
  selector: 'app-add-photos',
  templateUrl: './add-photos.component.html',
  styleUrl: './add-photos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackButtonComponent, MemoryAddPhotosComponent],
})
export class AddPhotosComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly memoryId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );
}