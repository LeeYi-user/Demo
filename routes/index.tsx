import { Head } from "$fresh/runtime.ts";
import Link from "../components/Link.tsx";

export default function Home() {
    return (
        <>
            <Head>
                <title>Demo</title>
            </Head>

            <div class="mt-4 ml-4">
                <Link>chat</Link>
            </div>
        </>
    )
}
