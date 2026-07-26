import { HttpError } from "fresh";
import { define } from "../../../utils.ts";
import {
  getBucket,
  getDb,
  type GridFSFile,
  ObjectId,
} from "../../../lib/mongo.ts";

export const handler = define.handlers({
  async GET(ctx) {
    let id: ObjectId;

    try {
      id = new ObjectId(ctx.params.files_id);
    } catch {
      throw new HttpError(404);
    }

    const db = await getDb();
    const file = await db.collection<GridFSFile>("fs.files").findOne({
      "_id": id,
    });

    if (!file) {
      throw new HttpError(404);
    }

    const bucket = await getBucket();
    const headers = new Headers({
      "content-disposition": `inline; filename="${
        encodeURIComponent(file.filename)
      }"`,
      "content-length": String(file.length),
    });

    const contentType = file.metadata?.contentType;

    if (typeof contentType === "string") {
      // `File.type` never carries a charset, and a bare `text/*` makes the
      // browser fall back to its locale's legacy encoding (Big5, windows-1252,
      // …) — which renders a UTF-8 file as mojibake when displayed inline.
      const needsCharset = contentType.startsWith("text/") &&
        !contentType.includes("charset=");

      headers.set(
        "content-type",
        needsCharset ? `${contentType}; charset=utf-8` : contentType,
      );
    }

    return new Response(
      ReadableStream.from(bucket.openDownloadStream(id)),
      { "headers": headers },
    );
  },
});
