"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/useAuthSession";

import { supabase } from "@/app/lib/supabase";
import { Game } from "@/app/types/supabase";
import { Database } from "@/app/types/database";

type GamesContextType = {
    games: Game[];
    loadingGames: boolean;
    error?: string;
    fetchGames: () => Promise<void>;
    getGameById: (id: number) => Game | undefined;
    updateGame: (id: number, updatedGame: Database["public"]["Tables"]["Games"]["Update"]) => Promise<void>;
    setGames: React.Dispatch<React.SetStateAction<Game[]>>;
};

const GamesContext = createContext<GamesContextType | undefined>(undefined);

type GamesProviderProps = {
    children: ReactNode;
};

export function GamesProvider({ children }: GamesProviderProps) {
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>(undefined);

    const { user, loading: authLoading } = useAuthSession();

    const fetchGames = useCallback(async (): Promise<void> => {
        if (!user) {
            setGames([]);
            setLoadingGames(false);
            return;
        }

        setLoadingGames(true);
        setError(undefined);

        const { data, error } = await supabase.from("Games").select("*").eq("user_id", user.id);

        setLoadingGames(false);

        if (!error && data) {
            setGames(data as unknown as Game[]);
            return;
        }

        setError(error?.message || "Failed to load games.");
    }, [user]);

    function getGameById(id: number): Game | undefined {
        return games.find((game) => game.id === id);
    }

    const updateGame = useCallback(async (id: number, updatedGame: Database["public"]["Tables"]["Games"]["Update"]): Promise<void> => {
        const { data, error } = await supabase.from("Games").update(updatedGame).eq("id", id).select().single();

        if (error) {
            throw error;
        }

        setGames((currentGames) => currentGames.map((game) => (game.id === id ? (data as Game) : game)));
    }, []);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setGames([]);
            setLoadingGames(false);
            return;
        }

        void fetchGames();
    }, [authLoading, user, fetchGames]);

    const value = useMemo<GamesContextType>(
        () => ({
            games,
            loadingGames,
            error,
            fetchGames,
            setGames,
            getGameById,
            updateGame,
        }),
        [games, loadingGames, error, fetchGames]
    );

    return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
}

export function useGames(): GamesContextType {
    const context = useContext(GamesContext);

    if (!context) {
        throw new Error("useGames must be used within a GamesProvider");
    }

    return context;
}
