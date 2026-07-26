import { page } from "fresh";
import { define } from "../utils.ts";
import { getDb, type GridFSFile } from "../lib/mongo.ts";
import { Link } from "../components/Link.tsx";

export const handler = define.handlers({
  async GET() {
    const db = await getDb();
    const files = await db.collection<GridFSFile>("fs.files").find().toArray();

    return page(files.map((file) => ({
      "id": file._id.toString(),
      "filename": file.filename,
    })));
  },
});

export default define.page<typeof handler>(function Download({ data }) {
  return (
    <div class="mt-4 ml-4">
      {data.map((file) => (
        <Link href={`/api/download/${file.id}`}>{file.filename}</Link>
      ))}
    </div>
  );
});
