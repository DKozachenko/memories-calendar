import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  InputSignal,
  OnInit,
  ViewEncapsulation,
  WritableSignal,
  inject,
  input,
  signal,
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
  public fileData: InputSignal<FileData> = input.required<FileData>({});

  public mediaSrc: WritableSignal<string> = signal<string>('');
  public time: WritableSignal<string> = signal<string>('');

  public ngOnInit(): void {
    this.mediaSrc.set(convertFileSrc(this.fileData().localUrl));
    this.time.set(this.getTime(this.fileData().dateTime));
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
