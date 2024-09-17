import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlbumService, DetailParams } from '../../../shared/service/api/album.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { TAlbumModel, TMediaModel } from '../../../shared/interface/album.interface';
import { filter, map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { IGalleryItem } from '../../../shared/interface/gallery.interface';
import { GalleryCustomThumbsComponent } from '../../../shared/component/gallery-custom-thumbs/gallery-custom-thumbs.component';
import { GalleryItemTemporarilyDeletedComponent } from '../../../shared/component/gallery-item-temporarily-deleted/gallery-item-temporarily-deleted.component';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';
import { FileDragAndDropComponent } from '../../../shared/component/file-drag-and-drop/file-drag-and-drop.component';
import { GalleryComponent } from '@daelmaak/ngx-gallery';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [
    CommonModule,

    GalleryComponent,

    MaterialModule,
    SetBaseUrlPipe
  ],
  providers: [SetBaseUrlPipe],
  templateUrl: './album-detail.component.html',
  styleUrl: './album-detail.component.scss'
})
export class AlbumDetailComponent {
  @ViewChild(FileDragAndDropComponent) childComponentRef!: FileDragAndDropComponent;
  albumDetail?: TAlbumModel;
  galleryItems: IGalleryItem[] = [];

  private subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private activetedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private albumService: AlbumService,
    private setBaseUrlPipe: SetBaseUrlPipe
  ) {

  }

  ngOnInit() {
    let albumDetail$ = this.activetedRoute.params.pipe(
      tap(res=>console.log(res)),
      map(params => {
        const detailParams: DetailParams = {route: params['route'] as string};
        return detailParams
      }),
      switchMap(detailParams => this.albumService.getDetail(detailParams))
    );

    this.subscription.add(
      albumDetail$.subscribe({
        next: res => {
          this.albumDetail = res;
          this.initImages(this.albumDetail.media)
        },
        error: error => {
          console.log(error);
          
          this.goBackAlbumList();
        }
      })
    )
  }

  private initImages(medias: Array<TMediaModel>): Array<IGalleryItem> {
    this.galleryItems = medias.map(media => {
      const src = this.setBaseUrlPipe.transform(media.url);
      const thumbSrc = this.setBaseUrlPipe.transform(media.thumbnailUrl);
      const galleryItem: IGalleryItem = {
        _id: media._id!,
        src,
        thumbSrc,
        alt: media.alternateName,
        description: media.description,
        video: media.type === 'video' ? true : false
      }
      return galleryItem;
    });

    return this.galleryItems;
  }

  edit(){
    this.router.navigate(['/album-edit'], {
      queryParams: {
        route: this.albumDetail?.route
      }
    });
  }

  goBackAlbumList() {
    this.router.navigate(['/album']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
