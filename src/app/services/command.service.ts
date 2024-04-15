import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { Observable, from } from 'rxjs';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { Command } from '../models/enums';

@Injectable()
export class CommandService {
  public execute<T = undefined, K extends InvokeArgs | undefined = undefined>(
    commandName: Command,
    args?: K,
  ): Observable<T> {
    return from(invoke<T>(commandName, args));
  }
}
