export interface CompanyProfile {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  showPrices: boolean;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'E-Catalogue Inc.',
  tagline: 'Search Your Products Here!',
  description: 'Your one-stop showcase for curated inventory. Maintain your catalog via the admin dashboard linked to Google Sheets.',
  email: 'hello@rupamarketing.app',
  phone: '0000000000',
  website: 'https://rupamarketing.vercel.app/',
  address: '123 Market Street, Suite 400, City,Hyderabad, India',
  showPrices: false,
};