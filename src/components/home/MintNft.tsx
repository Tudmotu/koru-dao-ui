import { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { supportedChains } from '../../blockchain/constants';
import { ethers, Signer } from 'ethers';
import { useAccount, useNetwork, useSigner } from 'wagmi';
import { nftContract } from '../../blockchain/contracts/nftContract.factory';
import { GelatoRelay, SponsoredCallERC2771Request } from '@gelatonetwork/relay-sdk';

const oneBalanceMumbaiApiKey = import.meta.env.VITE_ONE_BALANCE_MUMBAI_API_KEY;
const oneBalancePolygonApiKey = import.meta.env.VITE_ONE_BALANCE_POLYGON_API_KEY;

export default function MintNft() {

    const {
        lensHandler,
        setMintModal,
        setIsMinting,
        totalNftMinted,
        totalNftSupply,
        isEligible,
        setMintTaskId,
    } = useContext(AppContext);

    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const mint = async () => {
        if (chain?.id === 137 && !lensHandler) return;
        try {
            setMintModal(true);
            const koruDaoNft = nftContract.connect(supportedChains[chain?.id as number].nft, signer as Signer);

            const data = koruDaoNft.interface.encodeFunctionData("mint", []);

            if (!chain || !address) throw new Error("!chain || !address");

            const request: SponsoredCallERC2771Request = {
                chainId: chain.id,
                target: koruDaoNft.address,
                data,
                user: address,
            };

            const relay = new GelatoRelay();
            const relayProvider = new ethers.providers.Web3Provider(window.ethereum as any);

            const oneBalanceApiKey = chain.id == 137 ? oneBalancePolygonApiKey : oneBalanceMumbaiApiKey;

            const response = await relay.sponsoredCallERC2771(
                request,
                relayProvider,
                oneBalanceApiKey,
            );

            if (response) {
                setMintTaskId(response.taskId);
                setIsMinting(true);
            }
        } catch (e) {
            console.log(e);
            setMintModal(false);
            setIsMinting(false);
        }
    };

    return (
        <div className="koru-bg-primary px-6 py-4 rounded-2xl">
            <div className="flex items-center gap-4 justify-between flex-col lg:flex-row">
                <div className="flex items-center gap-6">
                    <figure className="w-14 shrink-0">
                        <img alt="Nft" src="./images/mint-icon.svg" className="inline-block" />
                    </figure>
                    <div className="text-center lg:text-left">
                        {chain?.id === 137 &&
                          <p className="font-bold text-lg koru-gradient-text-3">
                              <span>{chain?.id === 137 ? totalNftSupply - totalNftMinted : totalNftSupply} </span>
                              NFTs available for minting
                          </p>
                        }
                        {chain?.id === 80001 &&
                          <>
                              <p className="font-bold text-lg koru-gradient-text-3">
                                  Testnet: Mint Open
                              </p>
                          </>
                        }
                        {!lensHandler && chain?.id === 137 &&
                          <p className="text-red-600 text-sm block">
                              You must have a Lens handle to mint.
                          </p>
                        }
                        {lensHandler && !isEligible &&
                          <p className="text-red-600 text-sm block">
                              You are not eligible to mint :(
                          </p>
                        }
                    </div>
                </div>
                <button
                    disabled={chain?.id === 137 && !lensHandler || !isEligible}
                    style={chain?.id === 137 && !lensHandler || !isEligible ? { opacity: 0.5 } : {}}
                    onClick={() => mint()}
                    className="koru-btn _pink inline-block"
                >
                    Claim Access Token
                </button>
            </div>
        </div>
    );
};
