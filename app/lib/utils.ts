import crypto from "crypto"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const generateRandomString = (length: number) =>
  crypto.randomBytes(length / 2).toString("hex")
