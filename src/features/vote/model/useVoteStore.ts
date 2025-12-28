import { create } from 'zustand';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

interface VoteState {
    step: 'landing' | 'gender' | 'mood' | 'result';
    gender: Gender | null;
    mood: Mood | null;
    region: string | null;     // Display Name (Localized)
    region_std: string | null; // Standard Name (English)
    coords: { lat: number; lng: number } | null;
    setStep: (step: 'landing' | 'gender' | 'mood' | 'result') => void;
    setGender: (gender: Gender) => void;
    setMood: (mood: Mood) => void;
    setRegion: (region: string, std?: string) => void; // Updated signature
    setCoords: (coords: { lat: number; lng: number }) => void;
    reset: () => void;
}

export const useVoteStore = create<VoteState>((set) => ({
    step: 'gender',
    gender: null,
    mood: null,
    region: null,
    region_std: null,
    coords: null,
    setStep: (step) => set({ step }),
    setGender: (gender) => set({ gender, step: 'mood' }),
    setMood: (mood) => set({ mood }),
    setRegion: (region, std) => set({ region, region_std: std || null }),
    setCoords: (coords) => set({ coords }),
    reset: () => set({ step: 'gender', gender: null, mood: null, region: null, region_std: null, coords: null }),
}));
