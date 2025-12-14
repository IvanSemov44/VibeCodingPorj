import React, { ReactElement } from 'react';

type BombProps = {
  explode?: boolean;
};

export default function Bomb({ explode = false }: BombProps): ReactElement | null {
  if (explode) {
    throw new Error('boom');
  }
  return <div data-testid="bomb">safe</div>;
}
