/* istanbul ignore file */

export enum TransactionStatusEnum {
  AccountDoesNotExist = "Account does not exist.",
  AccountIsClosed = "Account is closed.",
  AlreadyExists = "Idempotency key already exists.",
  Failed = "Failed",
  InsufficientFunds = "Insufficient funds",
  MustExceedZero = "Balance amount must be greater than $0.00",
  Success = "Success",
  UserDoesNotExist = "User does not exist.",
}
