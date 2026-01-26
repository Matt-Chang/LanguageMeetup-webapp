import { TableWrapper } from './tables';

export interface Venue {
    id: string;
    name: string;
    address: string;
    googleMapsLink?: string;
    dayOfWeek: number; // 0=Sun, 1=Mon... 4=Thu, 6=Sat
    time: string;
    fee: string;
    feeNote: string;
    description: string;
    tables: TableWrapper[]; // Changed from string[] to TableWrapper[]
    importantInfo: string; // Changed from string[] to text block
    externalRegistrationLink?: string; // New field for external sign up
    mapType: 'mercy' | 't2' | 'none';
}


// VENUES constant removed in favor of database


export const TABLE_DISPLAY_NAMES: Record<string, string> = {
    'free-talk': 'English - Free Talk Table',
    'it': 'English - AI / IT Table',
    'japanese': 'Japanese - Language Exchange Table',
    'board-game': 'English - Board Game Table'
};

export const TABLE_LIMITS: Record<string, number> = {
    'free-talk': 10,
    'it': 5,
    'japanese': 10,
    'board-game': 10
};
