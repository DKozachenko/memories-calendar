import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { TuiAlertModule, TuiButtonModule, TuiDialogContext } from '@taiga-ui/core';
import { TuiCarouselModule, TuiPaginationModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { FileData } from '@bindings/file-data.type';
import { FileCardComponent } from '../file-card/file-card.component';

@Component({
  selector: 'app-files-carousel-modal',
  standalone: true,
  imports: [TuiButtonModule, TuiPaginationModule, TuiCarouselModule, TuiAlertModule, FileCardComponent],
  providers: [TuiDestroyService],
  templateUrl: './files-carousel-modal.component.html',
  styleUrl: './files-carousel-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesCarouselModalComponent implements OnInit {
  private readonly context: TuiDialogContext<void, FileData[]> =
    inject<TuiDialogContext<void, FileData[]>>(POLYMORPHEUS_CONTEXT);

  public filesData: WritableSignal<FileData[]> = signal<FileData[]>([]);

  public index: WritableSignal<number> = signal<number>(0);
  public isLeftButtonDisabled: WritableSignal<boolean> = signal<boolean>(false);
  public isRightButtonDisabled: WritableSignal<boolean> = signal<boolean>(false);

  public ngOnInit(): void {
    this.filesData.set(this.context.data);
    this.resetButtonDisabling();
  }

  public scrollLeft(): void {
    if (this.index() <= 0) {
      return;
    }

    this.index.update((value: number) => --value);
    this.resetButtonDisabling();
  }

  public scrollRight(): void {
    if (this.index() >= this.filesData().length - 1) {
      return;
    }

    this.index.update((value: number) => ++value);
    this.resetButtonDisabling();
  }

  public trackByLocalUrl(item: FileData, index: number): string {
    return item.localUrl;
  }

  private resetButtonDisabling(): void {
    this.isLeftButtonDisabled.set(this.index() <= 0);
    this.isRightButtonDisabled.set(this.index() >= this.filesData().length - 1);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key == 'ArrowLeft') {
      this.scrollLeft();
    }
    if (event.key == 'ArrowRight') {
      this.scrollRight();
    }
  }
}
