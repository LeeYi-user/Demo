import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { Select } from "../components/Select.tsx";

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
    const [disableCall, setDisableCall] = useState<boolean>(true);
    const [peers, setPeers] = useState<string[]>([]);
    const [target, setTarget] = useState<string>("Random");
    const [calling, setCalling] = useState<boolean>(false);
    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const callButton = useRef<HTMLButtonElement>(null);

    useEffect(() =>
    {
        navigator.mediaDevices.getUserMedia({ "video": true, "audio": true }).then((value) => setLocalStream(value))
        setRemoteStream(new MediaStream());
        setPc(new RTCPeerConnection(ICE_SERVERS));
    }, []);

    useEffect(() => {
        if (target !== "Random" && peers.indexOf(target) === -1)
        {
            setTarget("Random");
        }
    }, [peers]);

    const startCall = useCallback(async () =>
    {
        let peer: string;

        if (target === "Random")
        {
            if (peers.length === 1)
            {
                return;
            }

            while (true)
            {
                peer = peers[Math.floor(Math.random() * peers.length)];

                if (peer !== id)
                {
                    break;
                }
            }
        }
        else
        {
            peer = target;
        }

        setCalling(true);

        pc!.onicecandidate = (event) =>
        {
            socket?.send(JSON.stringify(
            {
                "id": id,
                "type": "candidate",
                "data": event.candidate?.toJSON(),
                "target": peer
            }));
        }

        const offerDescription = await pc?.createOffer();
        await pc?.setLocalDescription(offerDescription);

        const offer =
        {
            "type": offerDescription?.type,
            "sdp": offerDescription?.sdp
        };

        socket?.send(JSON.stringify(
        {
            "id": id,
            "type": "offer",
            "data": offer,
            "target": peer
        }));
    }, [socket, peers, target]);

    useEffect(() =>
    {
        if (!localStream)
        {
            return;
        }

        let receiver = false;

        localStream.getTracks().forEach((track) =>
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

        const protocol = (location.protocol === "http:") ? "ws:" : "wss:";
        const socket = new WebSocket(`${ protocol }//${ location.host }/api/ws`);

        socket.onopen = () =>
        {
            socket.send(JSON.stringify(
            {
                "id": id,
                "type": "join"
            }));

            setDisableCall(false);
        };

        socket.onmessage = async (event) =>
        {
            const body = JSON.parse(event.data);

            if (body.type === "update")
            {
                setPeers(body.data);
            }
            else if (body.type === "offer")
            {
                receiver = true;

                setCalling(true);

                pc!.onicecandidate = (event) =>
                {
                    socket.send(JSON.stringify(
                    {
                        "id": id,
                        "type": "candidate",
                        "data": event.candidate?.toJSON(),
                        "target": body.id
                    }));
                }

                const offerDescription = new RTCSessionDescription(body.data);
                pc?.setRemoteDescription(offerDescription);

                const answerDescription = await pc?.createAnswer();
                await pc?.setLocalDescription(answerDescription);

                const answer =
                {
                    "type": answerDescription?.type,
                    "sdp": answerDescription?.sdp,
                };

                socket.send(JSON.stringify(
                {
                    "id": id,
                    "type": "answer",
                    "data": answer,
                    "target": body.id
                }));
            }
            else if (body.type === "answer")
            {
                if (receiver)
                {
                    socket.close();
                    alert("Your target has left.");
                    location.reload();
                    return;
                }

                const answerDescription = new RTCSessionDescription(body.data);
                pc?.setRemoteDescription(answerDescription);
            }
            else if (body.type === "candidate" && body.data)
            {
                const candidate = new RTCIceCandidate(body.data);
                pc?.addIceCandidate(candidate);
            }
            else if (body.type === "kick")
            {
                socket.close();
                alert("Your target has left.");
                location.reload();
                return;
            }
        };

        setSocket(socket);
    }, [localStream]);

    return (
        <div>
            Your ID: { id }

            <div class="mt-1 flex flex-col sm:flex-row">
                <video class="border border-black max-w-[100vw] max-h-[50vh]" ref={ localVideo } autoPlay playsInline muted/>
                <video class="mt-1 sm:mt-0 sm:ml-1 border border-black max-w-[100vw] max-h-[50vh]" ref={ remoteVideo } autoPlay playsInline/>
            </div>

            { calling ? null :
                <div class="mt-1">
                    <Select onChange={ (event) => setTarget((event.target as HTMLSelectElement).value) }>
                        <option>Random</option>
                        {
                            peers.map((peer) =>
                            {
                                if (peer !== id)
                                {
                                    return (
                                        <option>{ peer }</option>
                                    )
                                }
                            })
                        }
                    </Select>

                    <Button class="ml-1" onClick={ startCall } ref={ callButton } disabled={ disableCall }>Call</Button>
                </div>
            }
        </div>
    );
}
