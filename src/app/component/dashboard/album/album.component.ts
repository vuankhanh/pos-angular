import { Component } from '@angular/core';
import { FileDragAndDropComponent } from '../../../shared/component/file-drag-and-drop/file-drag-and-drop.component';
import { IRequestParamsWithFiles } from '../../../shared/interface/request.interface';
import { MaterialModule } from '../../../shared/module/material';
import { IAlbum } from '../../../shared/interface/album.interface';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AlbumService } from '../../../shared/service/api/album.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { RouterLink } from '@angular/router';

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
  imageMIMETypes: Array<string> = ['image/png', 'image/jpeg', 'image/jpg'];
  albums: Array<IAlbum> = [];
  
  private subscription: Subscription = new Subscription();
  constructor(
    private albumService: AlbumService,
    private dialog: MatDialog
  ){

  }
  
  ngOnInit(){
    this.getAll();
  }

  private getAll(){
    this.subscription.add(
      this.albumService.getAll().subscribe(res=>{
        const metaData: Array<IAlbum> = res.metaData.data;
        this.albums = metaData;
        console.log(`albums: `);
        console.log(this.albums);
      })
    )
  }

  handleFilesUploaded(params: IRequestParamsWithFiles): void {
    // const api = this.hightlightMarketing ? this.updateRequest(params) : this.createRequest(params);
    // this.subscription.add(
    //   api.subscribe((hightlightMarketing) => {
    //     this.childComponentRef.isEditing = true;
    //     this.hightlightMarketing = hightlightMarketing;
    //   })
    // )
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
