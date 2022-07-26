import Header from './components/globals/Header';
import { useAccount } from 'wagmi';
import iconGelato from '@/assets/icons/icon-gelato.svg';
import { AppContext } from './contexts/AppContext';
import { useContext } from 'react';
import MessageBox from './components/home/MessageBox';
import ConnectModal from './components/modals/ConnectModal';
import PostsBox from './components/home/PostsBox';
import NoHandlerModal from './components/modals/NoHandlerModal';

export default function App() {
    const { isConnected } = useAccount();
    const { connectModal, lensHandler, noLensModal } = useContext(AppContext);

    return (
        <div className="mx-auto container p-5 pb-20 relative">
            <Header />
            <main className="text-center mt-6 lg:mt-20 md:w-[640px] mx-auto">

                <MessageBox />

                <PostsBox />

            </main>

            <div className="w-44 mx-auto mt-20">
                <img src={iconGelato} alt="Powered by Gelato" />
            </div>

            {connectModal && <ConnectModal />}

            {isConnected && !lensHandler && noLensModal && <NoHandlerModal />}
        </div>
    );
}
