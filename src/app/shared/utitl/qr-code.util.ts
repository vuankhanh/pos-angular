import { IBaseBankPayment } from "../interface/bank-payment.interface";

export class Qr {
	static PREFIX = '000201010212';
	static SUFFIX = '6304';
	static PART_11_PREFIX = '0010A00000072701';
	static PART_2_PREFIX = '5303704';
	static AMOUNT_HEADER = '54';
	static PART_21_PREFIX = '5802VN62';
	static CHECK_SUM_LENGTH = 4;

	static decoder(input: string): IBaseBankPayment {
		let parts = input.substring(
			Qr.PREFIX.length,
			input.length - Qr.SUFFIX.length - Qr.CHECK_SUM_LENGTH
		);
		parts = parts.substring(2);
		let part1Length = parseInt(parts.substring(0, 2));
		parts = parts.substring(2);
		let part1 = parts.substring(0, part1Length);

		part1 = part1.substring(Qr.PART_11_PREFIX.length);
		let part12Length = parseInt(part1.substring(0, 2));
		part1 = part1.substring(2);
		let part12 = part1.substring(0, part12Length);

		part12 = part12.substring(2);
		let bankBinLength = parseInt(part12.substring(0, 2));
		part12 = part12.substring(2);
		let bankBin = part12.substring(0, bankBinLength);

		part12 = part12.substring(bankBinLength);
		part12 = part12.substring(2);
		let accountNumberLength = parseInt(part12.substring(0, 2));
		part12 = part12.substring(2);
		let accountNumber = part12.substring(0, accountNumberLength);

		let amount: string = '';
		parts = parts.substring(part1Length);
		let part2 = parts.substring(Qr.PART_2_PREFIX.length);

		if (part2.startsWith(Qr.AMOUNT_HEADER)) {
			part2 = part2.substring(2);
			let amountLength = parseInt(part2.substring(0, 2));
			part2 = part2.substring(2);
			amount = part2.substring(0, amountLength);
			part2 = part2.substring(amountLength);
		}

		let addInfo = '';
		if (part2.length - Qr.PART_21_PREFIX.length > Qr.PART_21_PREFIX.length) {
			part2 = part2.substring(Qr.PART_21_PREFIX.length);
			let part21Length = parseInt(part2.substring(0, 2));
			part2 = part2.substring(2);
			let part21 = part2.substring(0, part21Length);
			part21 = part21.substring(2);
			let addInfoLength = parseInt(part21.substring(0, 2));
			part21 = part21.substring(2);
			addInfo = part21.substring(0, addInfoLength);
		}

		return { bankBin, accountNumber, amount, addInfo };
	}

  static validateQrCode(bankPayment: IBaseBankPayment): boolean {
    return !!bankPayment.bankBin && !!bankPayment.accountNumber
  }
}