export type AuthRole = 'admin' | 'member';

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'FORMER';
export type ClubFeeType = 'JOINING_FEE' | 'MEMBERSHIP_FEE';
export type MembershipFeeCycle = 'ANNUAL' | 'MONTHLY' | 'QUARTERLY';
export type PaymentMethod = 'MPESA' | 'BANK' | 'CASH';
export type PaymentStatus = 'VERIFIED' | 'PENDING' | 'FAILED';
export type ClubPosition =
  | 'CHAIRMAN'
  | 'VICE_CHAIR'
  | 'SECRETARY'
  | 'VICE_SECRETARY'
  | 'TREASURER';
export type ElectionStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'TALLIED';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  createdAt?: string;
}

export interface Member {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string | null;
  joinedAt: string;
  status: MemberStatus;
  user?: AuthUser;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  profilePhotoUrl?: string;
  joinedAt?: string;
  status?: MemberStatus;
}

export interface UpdateMemberDto {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  profilePhotoUrl?: string;
  joinedAt?: string;
  status?: MemberStatus;
}

export interface MemberFinancialStatus {
  id: string;
  memberId: string;
  status: MemberStatus;
  hasJoiningFee: boolean;
  hasCurrentMembershipFee: boolean;
  canVote: boolean;
}

export interface ClubFeeSetting {
  id: string;
  joiningFee: number | string;
  membershipFee: number | string;
  membershipFeeCycle: MembershipFeeCycle;
  currency: string;
  isActive: boolean;
  notes?: string | null;
  updatedBy?: AuthUser;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertFeeSettingDto {
  joiningFee: number;
  membershipFee: number;
  membershipFeeCycle?: MembershipFeeCycle;
  currency?: string;
  notes?: string;
}

export interface DarajaTransaction {
  id: string;
  type: 'STK_PUSH' | 'C2B_PAYBILL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  checkoutRequestId?: string | null;
  mpesaReceiptNumber?: string | null;
  amount: number | string;
  phoneNumber: string;
  accountReference?: string | null;
  resultDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordedBy {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export interface Payment {
  id: string;
  member?: Member;
  feeType: ClubFeeType;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  darajaTransaction?: DarajaTransaction | null;
  recordedBy?: RecordedBy | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  paidAt?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  memberId: string;
  feeType: ClubFeeType;
  amount?: number;
  method: PaymentMethod;
  transactionRef?: string;
  periodStart?: string;
  periodEnd?: string;
  darajaTransactionId?: string;
  paidAt?: string;
}

export interface MemberMpesaPaymentDto {
  feeType: ClubFeeType;
  phoneNumber?: string;
}

export interface Election {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  status: ElectionStatus;
  candidates?: Candidate[];
  results?: ElectionResult[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateElectionDto {
  title: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  votingWindowHours?: number;
}

export interface Candidate {
  id: string;
  member: Member;
  position: ClubPosition;
  profilePhotoUrl?: string | null;
  manifesto?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateDto {
  memberId: string;
  position: ClubPosition;
  profilePhotoUrl?: string;
  manifesto?: string;
}

export interface ElectionResult {
  id: string;
  election?: Election;
  candidate: Candidate;
  position: ClubPosition;
  totalVotes: number;
  isWinner: boolean;
  talliedAt: string;
}

export const CLUB_POSITIONS: { label: string; value: ClubPosition }[] = [
  { label: 'Chairman', value: 'CHAIRMAN' },
  { label: 'Vice Chair', value: 'VICE_CHAIR' },
  { label: 'Secretary', value: 'SECRETARY' },
  { label: 'Vice Secretary', value: 'VICE_SECRETARY' },
  { label: 'Treasurer', value: 'TREASURER' },
];

export const POSITION_LABELS: Record<ClubPosition, string> = {
  CHAIRMAN: 'Chairman',
  VICE_CHAIR: 'Vice Chair',
  SECRETARY: 'Secretary',
  VICE_SECRETARY: 'Vice Secretary',
  TREASURER: 'Treasurer',
};

export const FEE_TYPE_LABELS: Record<ClubFeeType, string> = {
  JOINING_FEE: 'Joining Fee',
  MEMBERSHIP_FEE: 'Membership Fee',
};
