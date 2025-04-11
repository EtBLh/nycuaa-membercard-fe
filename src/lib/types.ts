export interface IMemberData {
  id: string;
  type?: string;
  name: string;
  govid: string;
  email: string;
  phone?: string;
  birthday?: string;
  permit: boolean
}

export interface IConference {
  id: number;
  date: string;
  name: string;
}