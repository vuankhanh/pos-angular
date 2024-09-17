import { Component, ViewChild } from '@angular/core';
import { FileDragAndDropComponent } from '../../../shared/component/file-drag-and-drop/file-drag-and-drop.component';
import { MaterialModule } from '../../../shared/module/material';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { Router, RouterLink } from '@angular/router';
import { AlbumShowComponent } from '../../../shared/component/album-show/album-show.component';
import { TAlbumModel } from '../../../shared/interface/album.interface';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [
    RouterLink,
    FileDragAndDropComponent,
    AlbumShowComponent,
    
    MaterialModule,

    SetBaseUrlPipe
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {
  @ViewChild(FileDragAndDropComponent) childComponentRef!: FileDragAndDropComponent;
  imageMIMETypes: Array<string> = ['image/png', 'image/jpeg', 'image/jpg'];
  
  constructor(
    private readonly router: Router
  ) { }

  ngOnInit() {
    console.log('AlbumComponent');
  }

  onCreateAlbum(){
    this.router.navigate(['/album-edit']);
  }

  handleChooseItem(album: TAlbumModel){
    this.router.navigate([`/album/${album.route}`]);
  }

  ngOnDestroy() {}
}
