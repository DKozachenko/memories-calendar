import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { FileData } from '@bindings/file-data.type';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { convertFileSrc } from '@tauri-apps/api/tauri';

@Component({
  selector: 'app-file-card',
  standalone: true,
  imports: [VideoPlayerComponent],
  templateUrl: './file-card.component.html',
  styleUrl: './file-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileCardComponent implements OnInit {
  @Input({ required: true }) fileData!: FileData;

  public mediaSrc: string = '';
  public time: string = '';

  public ngOnInit(): void {
    this.mediaSrc = convertFileSrc(this.fileData.localUrl);
    this.time = this.getTime(this.fileData.dateTime);
  }

  private getTime(dateStr: string): string {
    const date: Date = new Date(dateStr);
    return (
      date.getHours().toString().padStart(2, '0') +
      ':' +
      (date.getMinutes() + 1).toString().padStart(2, '0') +
      ':' +
      date.getSeconds().toString().padStart(2, '0')
    );
  }
}
