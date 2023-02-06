import { useRef } from "preact/hooks";
import Button from "../components/Button.tsx";

export default function UploadArea()
{
    const fileInput = useRef<HTMLInputElement>(null);

    async function submit()
    {
        const file = fileInput.current!.files![0];
        const formData = new FormData();

        formData.append("name", file.name);
        formData.append("data", file);

        await fetch("/api/upload",
        {
            method: "POST",
            body: formData
        });

        fileInput.current!.value = "";
    }

    return (
        <div>
            <input type="file" ref={ fileInput }/>
            <Button onClick={ submit }>Submit</Button>
        </div>
    );
}
