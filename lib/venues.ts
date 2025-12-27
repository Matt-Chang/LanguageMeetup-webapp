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
    tables: string[];
    importantInfo: string[];
    mapType: 'mercy' | 't2' | 'none'; // Updated to include t2
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
