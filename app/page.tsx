import { EuclidExperience } from "./EuclidExperience";
import bookOne from "./data/book-1.json";
import bookTwo from "./data/book-2.json";
import bookThree from "./data/book-3.json";
import bookFour from "./data/book-4.json";
import bookFive from "./data/book-5.json";
import bookSix from "./data/book-6.json";
import bookSeven from "./data/book-7.json";
import bookEight from "./data/book-8.json";
import bookNine from "./data/book-9.json";
import bookTen from "./data/book-10.json";
import bookEleven from "./data/book-11.json";
import bookTwelve from "./data/book-12.json";
import bookThirteen from "./data/book-13.json";
import type { EuclidBook } from "./data/types";

export default function Home() {
  const books = [
    bookOne,
    bookTwo,
    bookThree,
    bookFour,
    bookFive,
    bookSix,
    bookSeven,
    bookEight,
    bookNine,
    bookTen,
    bookEleven,
    bookTwelve,
    bookThirteen,
  ] as EuclidBook[];

  return <EuclidExperience books={books} />;
}
