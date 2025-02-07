import UiIcon from '../globals/UiIcon';
import { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useAccount, useNetwork, useSigner } from 'wagmi';
import { ethers, Signer } from 'ethers';
import { supportedChains } from '../../blockchain/constants';
import { v4 as uuid } from 'uuid';
import { pinToIPFS, uploadToIPFS } from '../../utils/ipfs';
// @ts-ignore
import CircularProgress from '../../utils/circularProgress';
import { CountTimer } from '../globals/CountTimer';
import { koruContract } from '../../blockchain/contracts/koruContract.factory';
import { GelatoRelay, SponsoredCallERC2771Request } from '@gelatonetwork/relay-sdk';

const oneBalanceMumbaiApiKey = import.meta.env.VITE_ONE_BALANCE_MUMBAI_API_KEY;
const oneBalancePolygonApiKey = import.meta.env.VITE_ONE_BALANCE_POLYGON_API_KEY;

export default function SendMessageBox() {

    const { chain } = useNetwork();
    const { address } = useAccount();
    const { data: signer } = useSigner();

    const { lensHandler, publications, setPublications, userPost, nftId, collectiveProfile }: any = useContext(AppContext);

    const [userMessage, setUserMessage] = useState<string>('');
    const [isPosted, setIsPosted] = useState<any>(false);
    const [isGettingSignature, setIsGettingSignature] = useState<any>(false);

    const uploadIpfs = async () => {
        const ipfs = {
            version: '1.0.0',
            metadata_id: uuid(),
            description: userMessage,
            content: userMessage,
            external_url: `${supportedChains[chain?.id as number].lensProfileUrl}/u/${supportedChains[chain?.id as number].lensHandle}`,
            image: null,
            imageMimeType: null,
            name: `Post by @${supportedChains[chain?.id as number].lensHandle}`,
            mainContentFocus: 'TEXT',
            contentWarning: null,
            attributes: [
                {
                    traitType: 'string',
                    key: 'type',
                    value: 'post',
                },
            ],
            media: null,
            createdOn: new Date(),
            appId: 'Koru DAO',
        };
        const { path } = await uploadToIPFS(ipfs);
        const pin = await pinToIPFS(path);
        console.log(pin);
        return path;
    };

    const makeLensPost = async () => {
        console.log('Making Lens post...')
        const koruDao = koruContract.connect(supportedChains[chain?.id as number].koru, signer as Signer);

        const cid = await uploadIpfs();
        const contentURI = "https://koru.infura-ipfs.io/ipfs/" + cid;
        console.log('Uploaded to IPFS...')

        const postData = {
            profileId: supportedChains[chain?.id as number].lensProfileId,
            contentURI,
            collectModule: supportedChains[chain?.id as number].freeCollectModule,
            collectModuleInitData:
                "0x0000000000000000000000000000000000000000000000000000000000000000",
            referenceModule: ethers.constants.AddressZero,
            referenceModuleInitData: "0x",
        };

        console.log('Encoding Relay transaction')
        const data = koruDao.interface.encodeFunctionData("post", [postData]);
        console.log('Encoded Relay transaction')

        if (!chain || !address) throw new Error("!chain || !address");

        const request: SponsoredCallERC2771Request = {
            chainId: chain.id,
            target: koruDao.address,
            data,
            user: address,
        };

        return request;
    };

    const post = async () => {
        try {
            setIsGettingSignature(true);

            const request = await makeLensPost();

            const relay = new GelatoRelay();
            const relayProvider = new ethers.providers.Web3Provider(window.ethereum as any);

            const oneBalanceApiKey = chain?.id == 137 ? oneBalancePolygonApiKey : oneBalanceMumbaiApiKey;

            const response = await relay.sponsoredCallERC2771(
                request,
                relayProvider,
                oneBalanceApiKey,
            );

            console.log(response);

            if (!response?.taskId) {
                throw 'Failed to post message';
            } else {
                setUserMessage('');
                setIsGettingSignature(false);
                setIsPosted(true);
            }
        } catch (e) {
            console.warn('Failed to post message', e);
            setIsGettingSignature(false);
            setIsPosted(false);
        }
    };

    return (
        <div>
            <div className="koru-box mt-6 lg:mt-10 p-10 min-h-[200px]">
                <div className="flex gap-4">
                    <span style={{ backgroundImage: `url('${collectiveProfile.picture}')`}} className="flex-none w-12 h-12 rounded-full bg-center bg-cover" />
                    <div className="text-left w-full">
                        <textarea
                            onChange={(e) => setUserMessage(e.target.value)}
                            disabled={isPosted || !nftId || !userPost?.canPost || isGettingSignature}
                            rows={4}
                            className="w-full p-4 min-h-[100px]"
                            placeholder="Hello, world!"
                            value={userMessage}
                        />
                    </div>
                </div>
            </div>
            {nftId && address && <div className="flex justify-end mt-10 items-center gap-6">

                <div className="text-sm opacity-30">

                    {isPosted ?
                        <>
                            <div>
                                You can post again in <CountTimer direction={'down'}
                                                                  timestamp={Date.now() + userPost.postInterval} />.
                            </div>
                        </>
                        :
                        <>
                            {userPost?.canPost ?
                                <div>
                                    {userPost?.lastPost === 0 ?
                                        nftId ? <p>Go ahead and publish your first post!</p>
                                            : <p>You need to own a Koru DAO NFT to publish your first post!</p>
                                        :
                                        <p>Your last post was <CountTimer timestamp={userPost?.lastPost} /> ago.</p>
                                    }
                                </div>
                                :
                                <div>
                                    You can post again in <CountTimer direction={'down'}
                                                                      timestamp={userPost?.lastPost + userPost?.postInterval} />.
                                </div>
                            }
                        </>
                    }
                </div>

                <CircularProgress
                  size={25}
                  strokeWidth={2}
                  percentage={parseInt(String((userMessage.length * 100) / 280))}
                  color={`var(--koru-color-${parseInt(String((userMessage.length * 100) / 280)) > 100 ? 'red' : 'purple'})`}
                />
                <button
                  disabled={userMessage.length <= 3 || !nftId || !userPost.canPost || isGettingSignature || parseInt(String((userMessage.length * 100) / 280)) > 100}
                  onClick={() => post()}
                  className={`koru-btn _primary w-44 flex items-center gap-4 justify-center ${parseInt(String((userMessage.length * 100) / 280)) > 100 ? 'opacity-20' : ''}`}
                >
                    {isGettingSignature ? <UiIcon icon={'loading'} classes="w-6 h-6" /> : 'Post'}
                </button>
            </div>
            }
        </div>
    );
};
