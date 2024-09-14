import { IPagination } from "./pagination.interface"
import { ISuccess } from "./success.interface"

export interface IAlbum {
  _id: string,
  name: string,
  description: string,
  route: string,
  thumbnail: string,
  media: Array<IMedia>,
  mediaItems: number,
  createdAt: Date,
  updatedAt: Date
}

export interface IMedia {
  _id: string,
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

export interface IAlbumResponse extends ISuccess {
  metaData: {
    data: Array<IAlbum>,
    paging: IPagination
  }
}

export interface IAlbumDetailRespone extends ISuccess {
  metaData: IAlbum
}