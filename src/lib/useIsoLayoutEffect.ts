"use client";

import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect on the client, useEffect on the server (avoids SSR warning).
export const useIsoLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;
