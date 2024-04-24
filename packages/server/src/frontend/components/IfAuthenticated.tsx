'use client';

import { FC, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useGlobalContext } from '../contexts';

/*
  This component prevents its children from rendering if the user's wallet is not connected.
*/
export const IfAuthenticated: FC<
  PropsWithChildren<{ loginButton?: ReactNode }>
> = ({ children, loginButton = <p>Not yet logged</p> }) => {
  const { user } = useGlobalContext();

  return user ? children : loginButton;
};
