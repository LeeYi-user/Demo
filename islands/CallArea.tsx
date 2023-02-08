import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import Button from "../components/Button.tsx";

export default function CallArea({ id }: { "id": string })
{
    const ICE_SERVERS: RTCConfiguration =
    {
        iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        }],
        iceCandidatePoolSize: 10
    };

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection>();
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() =>
    {
        navigator.mediaDevices.getUserMedia({ "video": true, "audio": true }).then((value) => setLocalStream(value))
        setRemoteStream(new MediaStream());
        setPc(new RTCPeerConnection(ICE_SERVERS));
    }, []);

    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const cameraButton = useRef<HTMLButtonElement>(null);
    const callButton = useRef<HTMLButtonElement>(null);
    const consoleLog = useRef<HTMLDivElement>(null);

    function startCamera()
    {
        localStream?.getTracks().forEach((track) =>
        {
            pc?.addTrack(track, localStream);
        });

        pc!.ontrack = (event) =>
        {
            event.streams[0].getTracks().forEach((track) =>
            {
                remoteStream?.addTrack(track);
            });
        };

        localVideo.current!.srcObject = localStream;
        remoteVideo.current!.srcObject = remoteStream;
    }

    const startCall = useCallback(async () =>
    {
        pc!.onicecandidate = (event) =>
        {
            socket?.send(JSON.stringify(
            {
                "id": id,
                "type": "candidate",
                "data": event.candidate?.toJSON()
            }));

            consoleLog.current!.innerHTML += "<p>send candidate</p>";
        }

        const offerDescription = await pc?.createOffer();
        await pc?.setLocalDescription(offerDescription);

        consoleLog.current!.innerHTML += "<p>set local description</p>";

        const offer =
        {
            "type": offerDescription?.type,
            "sdp": offerDescription?.sdp
        };

        socket?.send(JSON.stringify(
        {
            "id": id,
            "type": "offer",
            "data": offer
        }));

        consoleLog.current!.innerHTML += "<p>send offer</p>";
    }, [socket]);

    useEffect(() =>
    {
        if (!localStream)
        {
            return;
        }

        const protocol = (location.protocol === "http:") ? "ws:" : "wss:";
        const socket = new WebSocket(`${ protocol }//${ location.host }/api/ws`);

        socket.onopen = () =>
        {
            socket.send(JSON.stringify(
            {
                "id": id,
                "type": "join"
            }));
        };

        socket.onmessage = async (event) =>
        {
            const body = JSON.parse(event.data);

            if (body.type === "join")
            {
                consoleLog.current!.innerHTML += `<p>new peer: ${ body.id }</p>`;
            }
            else if (body.type === "offer")
            {
                consoleLog.current!.innerHTML += "<p>receive offer<p/>";

                pc!.onicecandidate = (event) =>
                {
                    socket.send(JSON.stringify(
                    {
                        "id": id,
                        "type": "candidate",
                        "data": event.candidate?.toJSON()
                    }));

                    consoleLog.current!.innerHTML += "<p>send candidate</p>";
                }

                const offerDescription = new RTCSessionDescription(body.data);
                pc?.setRemoteDescription(offerDescription);

                consoleLog.current!.innerHTML += "<p>set remote description</p>";

                const answerDescription = await pc?.createAnswer();
                await pc?.setLocalDescription(answerDescription);

                consoleLog.current!.innerHTML += "<p>set local description</p>";

                const answer =
                {
                    "type": answerDescription?.type,
                    "sdp": answerDescription?.sdp,
                };

                socket.send(JSON.stringify(
                {
                    "id": id,
                    "type": "answer",
                    "data": answer
                }));

                consoleLog.current!.innerHTML += "<p>send answer</p>";
            }
            else if (body.type === "answer")
            {
                consoleLog.current!.innerHTML += "<p>receive answer</p>";

                const answerDescription = new RTCSessionDescription(body.data);
                pc?.setRemoteDescription(answerDescription);

                consoleLog.current!.innerHTML += "<p>set remote description</p>";
            }
            else if (body.type === "candidate" && body.data)
            {
                consoleLog.current!.innerHTML += "<p>receive candidate</p>";

                const candidate = new RTCIceCandidate(body.data);
                pc?.addIceCandidate(candidate);

                consoleLog.current!.innerHTML += "<p>add candidate</p>";
            }
        };

        setSocket(socket);
    }, [localStream]);

    return (
        <div>
            <div>
                <video class="border border-black" ref={ localVideo } autoPlay playsInline muted/>
            </div>
            
            <div class="mt-1">
                <video class="border border-black" ref={ remoteVideo } autoPlay playsInline/>
            </div>

            <div class="mt-1">
                <Button onClick={ startCamera } ref={ cameraButton }>Start Camera</Button>
                <Button class="ml-1" onClick={ startCall } ref={ callButton }>Start Call</Button>
            </div>

            <div class="mt-1" ref={ consoleLog }/>
        </div>
    );
}
