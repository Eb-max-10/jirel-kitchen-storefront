declare module '@paystack/inline-js' {
  export interface PaystackTransactionSuccess {
    reference: string;
    trans?: string;
    status?: string;
    message?: string;
    transaction?: string;
    [key: string]: unknown;
  }

  export interface PaystackMetadataCustomField {
    display_name: string;
    variable_name: string;
    value: string;
  }

  export interface PaystackMetadata {
    custom_fields?: PaystackMetadataCustomField[];
    [key: string]: unknown;
  }

  export interface PaystackNewTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    reference?: string;
    metadata?: PaystackMetadata;
    channels?: string[];
    onSuccess?: (transaction: PaystackTransactionSuccess) => void | Promise<void>;
    onCancel?: () => void;
  }

  export default class PaystackPop {
    constructor();
    newTransaction(options: PaystackNewTransactionOptions): void;
  }
}
