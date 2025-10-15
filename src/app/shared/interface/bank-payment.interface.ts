export interface IBaseBankPayment {
  bankBin: string;
  accountNumber: string;
  amount: string;
  addInfo: string;
}

export interface IBankPayment {
  bankBin: string;
  bankAvatar: string;
  bankShortName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}