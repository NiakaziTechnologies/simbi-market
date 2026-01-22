// @ts-nocheck
export interface SellerRecord {
  id: string;
  email: string;
  password: string;
  businessName: string;
  tradingName?: string;
  businessAddress: string;
  contactNumber: string;
  tin: string;
  registrationNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  contactPerson?: string;
  city?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  sriScore: number;
  createdAt: string;
  updatedAt: string;
}

export const sellers: SellerRecord[] = [
  {
    id: "seller-1761054638489",
    email: "nyashakarata1@gmail.com",
    password: "$2b$10$GGt297Z.yOAnO8B3aozZaesTbsxxvJ5Roctz5u6riJmO6nMfyqVb2", // hashed "Kundainyasha"
    businessName: "John's Auto Parts Ltd",
    tradingName: "John's Parts",
    businessAddress: "123 Main Street, Harare, Zimbabwe",
    contactNumber: "+263771234567",
    tin: "TAX123456",
    registrationNumber: "REG789012",
    bankAccountName: "John's Auto Parts Ltd",
    bankAccountNumber: "9876543210",
    bankName: "CBZ Bank",
    status: "APPROVED",
    sriScore: 0,
    createdAt: "2025-10-21T13:50:38.489Z",
    updatedAt: "2025-10-21T13:50:38.489Z"
  }
];
