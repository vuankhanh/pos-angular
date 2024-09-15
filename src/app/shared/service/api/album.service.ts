import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, expand, map, Observable, toArray } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { IAlbum, IAlbumDetailRespone, IAlbumResponse } from '../../interface/album.interface';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private url: string = environment.backendApi + '/album'
  constructor(
    private httpClient: HttpClient
  ) { }

  getAll(page?: number, size?: number) {
    let params = new HttpParams();
    if (page != undefined) {
      params = params.append('page', page)
    }
    if (size != undefined) {
      params = params.append('size', size)
    }
    return this.httpClient.get<IAlbumResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(detailParams: DetailParams): Observable<IAlbum> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(detailParams)) {
      params = params.append(k, v)
    }
    return this.httpClient.get<IAlbumDetailRespone>(this.url + '/detail', { params }).pipe(
      map(res => res.metaData)
    );
  }

  create(name: string, files: Array<Blob>) {
    let params = new HttpParams();
    params = params.append('name', name)
    const formData = new FormData();
    if (files.length) {
      for (let [index, file] of files.entries()) {
        formData.append('files', file);
      }
    }
    return this.httpClient.post<IAlbumDetailRespone>(this.url, formData, { params });
  }

  addNewFiles(detailParams: DetailParams, files: Array<Blob>): Observable<IAlbum> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(detailParams)) {
      params = params.append(k, v)
    }
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    return this.httpClient.patch<IAlbumDetailRespone>(this.url + '/add-new-files', formData, { params }).pipe(
      map(res => res.metaData)
    );
  }

  removeFiles(detailParams: DetailParams, filesWillRemove: Array<string>): Observable<IAlbum> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(detailParams)) {
      params = params.append(k, v)
    }
    return this.httpClient.patch<IAlbumDetailRespone>(this.url + '/remove-files', { filesWillRemove }, { params }).pipe(
      map(res => res.metaData)
    );
  }

  itemIndexChange(detailParams: DetailParams, newItemIndexChange: Array<string>): Observable<IAlbum> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(detailParams)) {
      params = params.append(k, v)
    }
    return this.httpClient.patch<IAlbumDetailRespone>(this.url + '/item-index-change', { newItemIndexChange }, { params }).pipe(
      map(res => res.metaData)
    );
  }

  delete(id: string) {
    return this.httpClient.delete<IAlbumDetailRespone>(this.url+'/'+id);
  }
}

export interface DetailParams {
  id?: string,
  route?: string
}