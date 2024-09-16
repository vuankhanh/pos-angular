import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlbumService, DetailParams } from '../../../shared/service/api/album.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { TAlbumModel, TMediaModel } from '../../../shared/interface/album.interface';
import { filter, map, Observable, Subscription, switchMap } from 'rxjs';
import { IGalleryItem } from '../../../shared/interface/gallery.interface';
import { GalleryCustomThumbsComponent } from '../../../shared/component/gallery-custom-thumbs/gallery-custom-thumbs.component';
import { GalleryItemTemporarilyDeletedComponent } from '../../../shared/component/gallery-item-temporarily-deleted/gallery-item-temporarily-deleted.component';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [
    CommonModule,

    GalleryCustomThumbsComponent,
    GalleryItemTemporarilyDeletedComponent,

    MaterialModule,
    SetBaseUrlPipe
  ],
  providers: [SetBaseUrlPipe],
  templateUrl: './album-detail.component.html',
  styleUrl: './album-detail.component.scss'
})
export class AlbumDetailComponent {
  albumDetail!: TAlbumModel;
  galleryItems: IGalleryItem[] = [];
  galleryItemTemporarilyDeleted: IGalleryItem[] = [];
  galleryItemIndexChanged: Array<string> = [];

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

  handleItemTemporaryDeletion(index: number): void {
    const item = this.galleryItems[index];
    this.galleryItemTemporarilyDeleted.push(item);
    this.galleryItems.splice(index, 1);
    this.galleryItems = [...this.galleryItems];
  }

  handleitemIndexChanged(galleryItems: Array<IGalleryItem>): void {
    this.galleryItemIndexChanged = galleryItems.map((item) => item._id)
  }

  onGalleryItemRestore(item: IGalleryItem): void {
    this.galleryItems = [...this.galleryItems, item];
  }

  update() {
    const filesWillRemove = this.galleryItemTemporarilyDeleted.map(item => item._id);
    const galleryItemIndexChanged = this.galleryItemIndexChanged;
    this.subscription.add(
      this.updateRequest(filesWillRemove, galleryItemIndexChanged).subscribe((mediaMetaData) => {
        this.albumDetail = mediaMetaData;
        this.galleryItemTemporarilyDeleted = [];
        this.galleryItemIndexChanged = [];
      })
    )
    
  }

  private updateRequest(filesWillRemove: Array<string>, galleryItemIndexChanged: Array<string>) {
    if(filesWillRemove.length > 0 && galleryItemIndexChanged.length > 0){
      return this.updateRemoveFilesRequest(filesWillRemove).pipe(
        switchMap(() => this.updateItemIndexChangeRequest(galleryItemIndexChanged))
      )
    }else{
      if(filesWillRemove.length > 0){
        return this.updateRemoveFilesRequest(filesWillRemove);
      }
      if(galleryItemIndexChanged.length > 0){
        return this.updateItemIndexChangeRequest(galleryItemIndexChanged);
      }
      return new Observable<TAlbumModel>();
    }
  }

  private updateRemoveFilesRequest(filesWillRemove: Array<string>) {
    const detailParams: DetailParams = {id: this.albumDetail._id!};
    return this.albumService.removeFiles(detailParams, filesWillRemove);
  }

  private updateItemIndexChangeRequest(galleryItemIndexChanged: Array<string>) {
    const detailParams: DetailParams = { id: this.albumDetail._id!};
    return this.albumService.itemIndexChange(detailParams, galleryItemIndexChanged)
  }

  remove() {
    const data: TConfirmDialogData = {
      title: 'Xóa Album',
      message: 'Bạn có chắc chắn muốn xóa album này không?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmColor: 'warn',
      cancelColor: 'primary'
    }
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data
    });

    this.subscription.add(
      dialogRef.afterClosed().pipe(
        filter(result => result),
        switchMap(() => this.albumService.delete(this.albumDetail._id))
      ).subscribe(res => {
        this.goBackAlbumList();
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
