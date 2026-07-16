import { EuclidReader } from "./EuclidReader";
import bookOne from "./data/book-1.json";
import type { EuclidBook } from "./data/types";

export default function Home() {
  return <EuclidReader book={bookOne as EuclidBook} />;
}
