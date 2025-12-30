import { create } from 'zustand';
import { getLocationDisplayName, getLocationScope } from '@/shared/lib/location/display';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

interface VoteState {
    step: 'landing' | 'gender' | 'mood' | 'result';
    gender: Gender | null;
    mood: Mood | null;
    region: string | null;     // Computed Display Name
    region_std: string | null; // Computed Standard Name (for Realtime)
    region_lv0: string | null;
    region_lv1: string | null;
    region_lv2: string | null;
    region_std_lv0: string | null;
    region_std_lv1: string | null;
    region_std_lv2: string | null;
    coords: { lat: number; lng: number } | null;
    setStep: (step: 'landing' | 'gender' | 'mood' | 'result') => void;
    setGender: (gender: Gender) => void;
    setMood: (mood: Mood) => void;
    setRegion: (data: {
        lv0?: string | null;
        lv1?: string | null;
        lv2?: string | null;
        std_lv0?: string | null;
        std_lv1?: string | null;
        std_lv2?: string | null;
    }) => void;
    setCoords: (coords: { lat: number; lng: number }) => void;
    reset: () => void;
}

export const useVoteStore = create<VoteState>((set, get) => ({
    step: 'gender',
    gender: null,
    mood: null,
    region: null,
    region_std: null,
    region_lv0: null,
    region_lv1: null,
    region_lv2: null,
    region_std_lv0: null,
    region_std_lv1: null,
    region_std_lv2: null,
    coords: null,

    setStep: (step) => set({ step }),
    setGender: (gender) => set({ gender, step: 'mood' }),
    setMood: (mood) => set({ mood }),
    setRegion: (data) => set((state) => {
        const nextState = {
            region_lv0: data.lv0 !== undefined ? data.lv0 : state.region_lv0,
            region_lv1: data.lv1 !== undefined ? data.lv1 : state.region_lv1,
            region_lv2: data.lv2 !== undefined ? data.lv2 : state.region_lv2,
            region_std_lv0: data.std_lv0 !== undefined ? data.std_lv0 : state.region_std_lv0,
            region_std_lv1: data.std_lv1 !== undefined ? data.std_lv1 : state.region_std_lv1,
            region_std_lv2: data.std_lv2 !== undefined ? data.std_lv2 : state.region_std_lv2,
        };

        const region = getLocationDisplayName({
            region_lv0: nextState.region_lv0 || undefined,
            region_lv1: nextState.region_lv1 || undefined,
            region_lv2: nextState.region_lv2 || undefined,
        }, '');

        const region_std = getLocationScope({
            region_lv0: nextState.region_std_lv0 || undefined,
            region_lv1: nextState.region_std_lv1 || undefined,
            region_lv2: nextState.region_std_lv2 || undefined,
        });

        return {
            ...nextState,
            region: region || null,
            region_std: region_std || null
        };
    }),
    setCoords: (coords) => set({ coords }),
    reset: () => set({
        step: 'gender',
        gender: null,
        mood: null,
        region: null,
        region_std: null,
        region_lv0: null,
        region_lv1: null,
        region_lv2: null,
        region_std_lv0: null,
        region_std_lv1: null,
        region_std_lv2: null,
        coords: null
    }),
}));
