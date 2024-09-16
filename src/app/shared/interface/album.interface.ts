import { IMongodbDocument } from "./mongo.interface";
import { IPagination } from "./pagination.interface"
import { ISuccess } from "./success.interface"

export interface IAlbum {
  name: string,
  description: string,
  route: string,
  thumbnail: string,
  media: Array<TMediaModel>,
  mediaItems: number,
  createdAt: Date,
  updatedAt: Date
}

export interface IMedia {
  url: string,
  thumbnailUrl: string,
  name: string,
  description: string,
  caption: string,
  alternateName: string,
  type: 'image' | 'video',
  willRemove?: boolean,
  created: Date,
  updated: Date,
}

export type TAlbumModel = IAlbum & IMongodbDocument;
export type TMediaModel = IMedia & IMongodbDocument;

export interface IAlbumResponse extends ISuccess {
  metaData: {
    data: Array<TAlbumModel>,
    paging: IPagination
  }
}

export interface IAlbumDetailRespone extends ISuccess {
  metaData: TAlbumModel
}