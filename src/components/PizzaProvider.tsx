"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readUser, writeUser } from "@/lib/identity";
import { loadData, savePlace, saveRating } from "@/lib/storage";
import { slugify } from "@/lib/scoring";
import type { Lens, Place, Rating, UserName } from "@/lib/types";

type PizzaState = {
  places: Place[];
  ratings: Rating[];
  lens: Lens;
  setLens: (lens: Lens) => void;
  user: UserName | null;
  setUser: (user: UserName | null) => void;
  cloud: boolean;
  ready: boolean;
  addPlace: (place: Omit<Place, "id"> & { id?: string }) => Promise<Place>;
  upsertRating: (rating: Omit<Rating, "id" | "updatedAt"> & { id?: string }) => Promise<void>;
};

const Ctx = createContext<PizzaState | null>(null);

export function PizzaProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [lens, setLens] = useState<Lens>("Todos");
  const [user, setUserState] = useState<UserName | null>(null);
  const [cloud, setCloud] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUserState(readUser());
    loadData()
      .then((data) => {
        setPlaces(data.places);
        setRatings(data.ratings);
        setCloud(data.cloud);
      })
      .finally(() => setReady(true));
  }, []);

  const setUser = useCallback((next: UserName | null) => {
    if (next) writeUser(next);
    else localStorage.removeItem("pizza-rank:user");
    setUserState(next);
  }, []);

  const addPlace = useCallback(async (input: Omit<Place, "id"> & { id?: string }) => {
    const base = input.id || slugify(input.name);
    const id = places.some((p) => p.id === base) ? `${base}-${Date.now().toString(36)}` : base;
    const place: Place = { ...input, id };
    setPlaces((prev) => [...prev, place]);
    await savePlace(place);
    return place;
  }, [places]);

  const upsertRating = useCallback(async (input: Omit<Rating, "id" | "updatedAt"> & { id?: string }) => {
    const rating: Rating = {
      id: input.id ?? `${input.placeId}-${input.userName.toLowerCase()}`,
      placeId: input.placeId,
      userName: input.userName,
      scores: input.scores,
      note: input.note,
      updatedAt: new Date().toISOString(),
    };
    setRatings((prev) => [
      ...prev.filter((r) => !(r.placeId === rating.placeId && r.userName === rating.userName)),
      rating,
    ]);
    await saveRating(rating);
  }, []);

  const value = useMemo(
    () => ({ places, ratings, lens, setLens, user, setUser, cloud, ready, addPlace, upsertRating }),
    [places, ratings, lens, cloud, ready, user, setUser, addPlace, upsertRating],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePizza() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePizza must be used within PizzaProvider");
  return ctx;
}
