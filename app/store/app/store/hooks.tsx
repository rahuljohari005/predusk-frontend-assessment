"use client";

import type { PropsWithChildren } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";

import { store, type AppDispatch, type RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export function StoreProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}