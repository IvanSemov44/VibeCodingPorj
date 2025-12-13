import { ReactElement } from "react";

export default function Bomb(): ReactElement {
  throw new Error('boom');
}