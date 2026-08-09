"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/useAuthSession";

import { supabase } from "@/app/lib/supabase";
import { Game } from "@/app/types/supabase";
import { Database } from "@/app/types/database";

/**
 * What a screen supplies when adding a game. Ownership is not the screen's
 * business — addGame stamps user_id from the active session.
 */
export type NewGame = Omit<Database["public"]["Tables"]["Games"]["Insert"], "user_id">;

type GamesContextType = {
    games: Game[];
    loadingGames: boolean;
    error?: string;
    fetchGames: () => Promise<void>;
    getGameById: (id: number) => Game | undefined;
    addGame: (newGame: NewGame) => Promise<Game>;
    updateGame: (id: number, updatedGame: Database["public"]["Tables"]["Games"]["Update"]) => Promise<void>;
    deleteGame: (id: number) => Promise<void>;
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

    const getGameById = useCallback(
        (id: number): Game | undefined => {
            return games.find((game) => game.id === id);
        },
        [games]
    );

    const addGame = useCallback(
        async (newGame: NewGame): Promise<Game> => {
            if (!user) {
                throw new Error("You must be signed in to add a game.");
            }

            // user_id is set here rather than left to a column default. Without
            // it the row is orphaned: every read filters on user_id, so the game
            // appears in local state and then vanishes on the next fetch.
            const { data, error } = await supabase
                .from("Games")
                .insert({ ...newGame, user_id: user.id })
                .select()
                .single();

            if (error) {
                throw error;
            }

            const insertedGame = data as Game;

            setGames((currentGames) => [...currentGames, insertedGame]);

            return insertedGame;
        },
        [user]
    );

    const updateGame = useCallback(async (id: number, updatedGame: Database["public"]["Tables"]["Games"]["Update"]): Promise<void> => {
        const { data, error } = await supabase.from("Games").update(updatedGame).eq("id", id).select().single();

        if (error) {
            throw error;
        }

        setGames((currentGames) => currentGames.map((game) => (game.id === id ? (data as Game) : game)));
    }, []);

    const deleteGame = useCallback(async (id: number): Promise<void> => {
        const { error } = await supabase.from("Games").delete().eq("id", id);

        if (error) {
            throw error;
        }

        setGames((currentGames) => currentGames.filter((game) => game.id !== id));
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
            addGame,
            updateGame,
            deleteGame,
        }),
        [games, loadingGames, error, fetchGames, getGameById, addGame, updateGame, deleteGame]
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
