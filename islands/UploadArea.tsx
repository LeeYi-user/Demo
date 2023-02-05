import { useRef } from "preact/hooks";
import Button from "../components/Button.tsx";

export default function UploadArea()
{
    const fileInput = useRef<HTMLInputElement>(null);

    function submit()
    {
        const reader = new FileReader();
        const file = fileInput.current!.files![0];

        reader.readAsArrayBuffer(file);

        reader.onload = async function()
        {
            const arrayBuffer = this.result;
            const array = new Uint8Array(arrayBuffer as ArrayBufferLike);

            await fetch("/api/upload",
            {
                method: "POST",
                body: JSON.stringify(
                {
                    "name": file.name,
                    "data": array
                })
            });

            fileInput.current!.value = "";
        }
    }

    return (
        <div>
            <input type="file" ref={ fileInput }/>
            <Button onClick={ submit }>Submit</Button>
        </div>
    );
}
