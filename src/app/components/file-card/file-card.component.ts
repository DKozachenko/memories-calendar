import { ChangeDetectionStrategy, Component, InputSignal, OnInit, WritableSignal, input, signal } from '@angular/core';
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

  public ngOnInit(): void {
    this.mediaSrc.set(convertFileSrc(this.fileData().localUrl));
  }
}
