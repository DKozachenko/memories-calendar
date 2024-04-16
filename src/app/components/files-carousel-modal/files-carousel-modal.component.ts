import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertModule, TuiAlertService, TuiButtonModule, TuiCalendarModule, TuiDialogContext } from '@taiga-ui/core';
import { TuiCarouselModule, TuiInputModule, TuiPaginationModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { CommandService, StoreService } from '../../services';
import { Command } from '../../models/enums';
import { takeUntil } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { IEventsMap } from '../../models/interfaces';

import { convertFileSrc } from '@tauri-apps/api/tauri';

@Component({
  selector: 'app-files-carousel-modal',
  standalone: true,
  imports: [TuiButtonModule, TuiPaginationModule, TuiCarouselModule, TuiAlertModule],
  providers: [TuiDestroyService],
  templateUrl: './files-carousel-modal.component.html',
  styleUrl: './files-carousel-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesCarouselModalComponent implements OnInit {
  private readonly context: TuiDialogContext<void, string[]> =
    inject<TuiDialogContext<void, string[]>>(POLYMORPHEUS_CONTEXT);
  private readonly commandService: CommandService = inject(CommandService);
  private readonly storeService: StoreService = inject(StoreService);
  private readonly alertService: TuiAlertService = inject(TuiAlertService);
  private readonly destroyService: TuiDestroyService = inject(TuiDestroyService);

  public photoUrls: string[] = [];

  public ngOnInit(): void {
    this.photoUrls = this.context.data.map((url: string) => convertFileSrc(url));
  }

  public index: number = 0;

  navigate(delta: number): void {
    this.index = this.index + delta < 0 ? this.photoUrls.length - 1 : (this.index + delta) % this.photoUrls.length;
  }
}
