import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Optional, Output } from '@angular/core';
import { MaterialModule } from '../../module/material';
import { BreakpointDetectionService } from '../../service/breakpoint-detection.service';
import { TAlbumModel } from '../../interface/album.interface';
import { SetBaseUrlPipe } from '../../pipe/set-base-url.pipe';
import { paginationConstant } from '../../../constant/pagination.constant';
import { IPagination } from '../../interface/pagination.interface';
import { PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlbumService } from '../../service/api/album.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-album-show',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    MaterialModule,

    SetBaseUrlPipe
  ],
  templateUrl: './album-show.component.html',
  styleUrl: './album-show.component.scss'
})
export class AlbumShowComponent {
  albums: Array<TAlbumModel> = [];
  pagination: IPagination = paginationConstant;
  nameSearch: string = '';

  @Output() chooseItemEvent: EventEmitter<TAlbumModel> = new EventEmitter<TAlbumModel>();
  pageSizeOptions: number[] = [2, 5, 10, 25, 100];
  breakpointDetection$ = this.breakpointDetectionService.detection$();
  
  subscription: Subscription = new Subscription();
  constructor(
    @Optional() private readonly dialogRef: MatDialogRef<AlbumShowComponent>,
    private albumService: AlbumService,
    private breakpointDetectionService: BreakpointDetectionService,
  ) {

  }

  ngOnInit() {
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  ngAfterViewInit() {
    console.log(this.dialogRef);
    
  }

  private getAll(name: string, page: number, size: number) {
    this.subscription.add(
      this.albumService.getAll(name, page, size).subscribe(res => {
        const metaData: Array<TAlbumModel> = res.data;
        this.albums = metaData;
        this.pagination = res.paging;
      })
    )
  }

  onItemClick(album: TAlbumModel) {
    if(this.dialogRef) {
      this.dialogRef.close(album);
    }else{
      this.chooseItemEvent.emit(album);
    }
  }

  handlePageEvent(event: PageEvent) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.size = event.pageSize;

    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }
}
