import { Injectable } from '@angular/core';
import { TMediaModel } from '../interface/album.interface';
import { GalleryItem } from '@daelmaak/ngx-gallery';
import { SetBaseUrlPipe } from '../pipe/set-base-url.pipe';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(
    private setBaseUrlPipe: SetBaseUrlPipe
  ) { }

  transform(medias: Array<TMediaModel>): Array<GalleryItem>{
    return medias.map(media => {
      const galleryItem: GalleryItem = {
        src: this.setBaseUrlPipe.transform(media.url),
        thumbSrc: this.setBaseUrlPipe.transform(media.thumbnailUrl),
        alt: media.alternateName || media.name,
        description: media.description,
        video: media.type === 'video',
      }
      return galleryItem;
    })
  }
}
