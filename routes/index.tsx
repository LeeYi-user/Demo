import { define } from "../utils.ts";
import { Link } from "../components/Link.tsx";

export default define.page(function Home() {
  return (
    <div class="mt-4 ml-4">
      <Link href="/call">call</Link>
      <Link href="/chat">chat</Link>
      <Link href="/game/index.html">game</Link>
      <Link href="/upload">upload</Link>
      <Link href="/download">download</Link>
    </div>
  );
});
