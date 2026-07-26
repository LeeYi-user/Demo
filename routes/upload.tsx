import { define } from "../utils.ts";
import UploadArea from "../islands/UploadArea.tsx";

export default define.page(function Upload() {
  return (
    <div class="mt-4 ml-4">
      <UploadArea />
    </div>
  );
});
