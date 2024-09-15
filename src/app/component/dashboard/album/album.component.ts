import { Component, ViewChild } from '@angular/core';
import { FileDragAndDropComponent } from '../../../shared/component/file-drag-and-drop/file-drag-and-drop.component';
import { IRequestParamsWithFiles } from '../../../shared/interface/request.interface';
import { MaterialModule } from '../../../shared/module/material';
import { IAlbum } from '../../../shared/interface/album.interface';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AlbumService } from '../../../shared/service/api/album.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { RouterLink } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { IPagination } from '../../../shared/interface/pagination.interface';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { paginationConstant } from '../../../constant/pagination.constant';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [
    RouterLink,
    MaterialModule,
    FileDragAndDropComponent,

    SetBaseUrlPipe
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {
  @ViewChild(FileDragAndDropComponent) childComponentRef!: FileDragAndDropComponent;
  imageMIMETypes: Array<string> = ['image/png', 'image/jpeg', 'image/jpg'];
  albums: Array<IAlbum> = [];
  pagination: IPagination = paginationConstant;
  pageSizeOptions: number[] = [2, 5, 10, 25, 100];
  breakpointDetection$ = this.breakpointDetectionService.detection$();
  private subscription: Subscription = new Subscription();
  constructor(
    private albumService: AlbumService,
    private breakpointDetectionService: BreakpointDetectionService,
  ) {

  }

  ngOnInit() {
    console.log('AlbumComponent');
    
    this.getAll(this.pagination.page, this.pagination.size);
  }

  private getAll(page: number, size: number) {
    this.subscription.add(
      this.albumService.getAll(page, size).subscribe(res => {
        const metaData: Array<IAlbum> = res.data;
        this.albums = metaData;
        this.pagination = res.paging;
      })
    )
  }

  handleFilesUploaded(params: IRequestParamsWithFiles): void {
    this.albumService.create(params.name, params.files).subscribe(res => {
      this.childComponentRef.resetForm();
      const metaData: IAlbum = res.metaData;
      this.albums.push(metaData);
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.size = event.pageSize;
    this.getAll(this.pagination.page, this.pagination.size);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
