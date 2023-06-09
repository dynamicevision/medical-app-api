export class MemberAccount {
  id: number;
  age?: number;
  gender?: string;
  govtId?: string;
  relation?: string;
}

export interface AccountsUsers {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
  member?: MemberAccount;
  doctor?: any;
}
