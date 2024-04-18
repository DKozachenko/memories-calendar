import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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

  public filesData: FileData[] = [];

  public index: number = 0;
  public isLeftButtonDisabled = false;
  public isRightButtonDisabled = false;

  public ngOnInit(): void {
    this.filesData = this.context.data;
    this.resetButtonDisabling();
  }

  public scrollLeft(): void {
    if (this.index <= 0) {
      return;
    }

    --this.index;
    this.resetButtonDisabling();
  }

  public scrollRight(): void {
    if (this.index >= this.filesData.length - 1) {
      return;
    }

    ++this.index;
    this.resetButtonDisabling();
  }

  public trackByLocalUrl(item: FileData, index: number): string {
    return item.localUrl;
  }

  private resetButtonDisabling(): void {
    this.isLeftButtonDisabled = this.index <= 0;
    this.isRightButtonDisabled = this.index >= this.filesData.length - 1;
  }
}
