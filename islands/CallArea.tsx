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

            console.log("send candidate");
        }

        const offerDescription = await pc?.createOffer();
        await pc?.setLocalDescription(offerDescription);

        console.log("set local description");

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

        console.log("send offer");
    }, [socket, peers, target]);

    useEffect(() =>
    {
        if (!localStream)
        {
            return;
        }

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

            if (body.type === "join" || body.type === "left")
            {
                setPeers(body.data);
            }
            else if (body.type === "offer")
            {
                console.log("receive offer");

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

                    console.log("send candidate");
                }

                const offerDescription = new RTCSessionDescription(body.data);
                pc?.setRemoteDescription(offerDescription);

                console.log("set remote description")

                const answerDescription = await pc?.createAnswer();
                await pc?.setLocalDescription(answerDescription);

                console.log("set local description");

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

                console.log("send answer");
            }
            else if (body.type === "answer")
            {
                console.log("receive answer");

                const answerDescription = new RTCSessionDescription(body.data);
                pc?.setRemoteDescription(answerDescription);

                console.log("set remote description");
            }
            else if (body.type === "candidate" && body.data)
            {
                console.log("receive candidate");

                const candidate = new RTCIceCandidate(body.data);
                pc?.addIceCandidate(candidate);

                console.log("add candidate");
            }
        };

        setSocket(socket);
    }, [localStream]);

    return (
        <div>
            Your ID: { id }

            <div class="mt-1">
                <video class="border border-black" ref={ localVideo } autoPlay playsInline muted/>
            </div>
            
            <div class="mt-1">
                <video class="border border-black" ref={ remoteVideo } autoPlay playsInline/>
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
