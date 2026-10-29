"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";
export function TrackView({ id, skip }: { id: string; skip?: boolean }) {
  useEffect(() => { if (!skip) track(id, "view"); }, [id, skip]);
  return null;
}
export function TrackLink({ id, kind, skip, ...rest }: { id: string; kind: "call" | "social"; skip?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...rest} onClick={(e) => { if (!skip) track(id, kind); rest.onClick?.(e); }} />;
}
