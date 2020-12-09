import React, {useState, useCallback, useContext} from 'react';
import { useRouter } from 'next/router';
import { SocketContext } from "../../contexts/SocketContext";
// import dynamic from 'next/dynamic';

// const Chat = dynamic(import('../../containers/Chat/Chat'), { ssr: false });

const VideoChatRoom: React.FC = () => {
    const router = useRouter();
    const [roomName, setRoomName] = useState('');
    const { actions: { emit } } = useContext(SocketContext);

    const handleCreateRoom = useCallback(async (e) => {
        e.preventDefault();
        const newRoom = await emit('one2one:createRoom', { roomName });
        await router.push(`/one2one/${newRoom.roomId}`);
    }, [roomName]);

    const handleSetRoomName = useCallback(({ target: { value } }) => {
        setRoomName(value);
    }, []);

    return (
        <div>
            One 2 One Video Chat
            <p>
                CreateRoom
            </p>
            <form onSubmit={handleCreateRoom}>
                <input
                    id="roomName"
                    type="text"
                    value={roomName}
                    onChange={handleSetRoomName}
                />
            </form>
        </div>
    )
};

export default VideoChatRoom;