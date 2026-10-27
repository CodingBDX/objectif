import { publicProfiles } from "./public";
import { cityList, Profile } from "./types";
import { slug } from "./site";
export const allProfiles = (): Promise<Profile[]> => publicProfiles();
export const cityBySlug = (ps: Profile[], s: string) => ps.flatMap(cityList).find((c) => slug(c) === s);
