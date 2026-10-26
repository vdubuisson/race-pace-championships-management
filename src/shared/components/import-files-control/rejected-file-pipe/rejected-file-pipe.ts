import { Pipe, PipeTransform } from '@angular/core';
import { TuiFileLike } from '@taiga-ui/kit';

@Pipe({ name: 'rejectedFile' })
export class RejectedFilePipe implements PipeTransform {
  transform(file: File): TuiFileLike {
    return {
      name: file.name,
      size: file.size,
      content: 'Invalid file name',
    };
  }
}
