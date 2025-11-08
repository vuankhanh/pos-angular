import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService, DetailParams } from '../../../shared/service/api/album.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { TAlbumModel, TMediaModel } from '../../../shared/interface/album.interface';
import { filter, map, Subscription, switchMap, tap } from 'rxjs';
import { IGalleryItem } from '../../../shared/interface/gallery.interface';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';
import { FileDragAndDropComponent } from '../../../shared/component/file-drag-and-drop/file-drag-and-drop.component';
import { GalleryComponent } from '@daelmaak/ngx-gallery';
import { MyDialogService } from '../../../shared/service/my-dialog.service';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [
    CommonModule,

    GalleryComponent,

    MaterialModule
  ],
  templateUrl: './album-detail.component.html',
  styleUrl: './album-detail.component.scss'
})
export class AlbumDetailComponent {
  private readonly router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private albumService: AlbumService = inject(AlbumService);
  private setBaseUrlPipe: SetBaseUrlPipe = inject(SetBaseUrlPipe);
  private myaDialogService = inject(MyDialogService);

  @ViewChild(FileDragAndDropComponent) childComponentRef!: FileDragAndDropComponent;
  albumDetail?: TAlbumModel;
  galleryItems: IGalleryItem[] = [];

  private subscription: Subscription = new Subscription();
  constructor(

  ) {

  }

  ngOnInit() {
    let albumDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const detailParams: DetailParams = { route: params['route'] as string };
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
        error: () => {
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

  edit() {
    this.router.navigate(['/album-edit'], {
      queryParams: {
        route: this.albumDetail?.route
      }
    });
  }

  remove() {
    const dialogData: TConfirmDialogData = {
      title: 'Xóa Album',
      message: 'Bạn có chắc chắn muốn xóa album này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    }

    const dialogRef = this.myaDialogService.open(ConfirmComponent, {
      data: dialogData
    });

    this.subscription.add(
      dialogRef.afterClosed().pipe(
        filter(result => result),
        switchMap(() => this.albumService.delete(this.albumDetail!._id))
      ).subscribe({
        next: res => {
          this.goBackAlbumList();
        },
        error: error => {
          console.error(error);
        },
        complete: () => {
          console.log('complete');
        }
      })
    )
  }

  goBackAlbumList() {
    this.router.navigate(['/album']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
