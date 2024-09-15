export interface IConfirmDialog {
  data: TConfirmDialogData;
  confirmAction?: Function;
  cancelAction?: Function;
}

export type TConfirmDialogData ={
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor?: string;
  cancelColor?: string;
}