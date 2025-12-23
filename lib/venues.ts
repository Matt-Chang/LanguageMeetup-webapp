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

export const VENUES: Record<string, Venue> = {
    mercy: {
        id: 'mercy',
        name: '慕溪園 (Mercy Café)',
        address: 'No. 71, Section 5, Xinglong Rd, Zhubei City, Hsinchu County 302',
        dayOfWeek: 4, // Thursday
        time: 'Every Thursday, 7:00 – 10:00 PM',
        fee: 'NTD 150',
        feeNote: '(Shared tea and snacks included)',
        description: '地點： 竹北市興隆路五段 71 號',
        tables: ['free-talk', 'it', 'japanese', 'board-game'],
        importantInfo: [
            'Feel free to switch tables anytime during the event.',
            'Photos and videos taken may be used for promotion.',
            'Be respectful and polite throughout the event.'
        ],
        mapType: 'mercy'
    },
    t2: {
        id: 't2',
        name: 'T2 Café',
        address: 'No. 101, Guangming 6th Rd, Zhubei City, Hsinchu County 30268',
        dayOfWeek: 5, // Friday
        time: 'Every Friday, 6:00 – 9:00 PM',
        fee: '1 Drink + 50 NTD',
        feeNote: '',
        description: '地點： 新竹縣竹北市光明六路101號',
        tables: ['board-game', 'free-talk'],
        importantInfo: [
            'Please support the venue by ordering a drink.',
            'Be respectful and polite throughout the event.'
        ],
        mapType: 't2' // Updated map type
    }
};

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
