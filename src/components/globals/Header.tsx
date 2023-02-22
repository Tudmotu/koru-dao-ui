import IconLogo from '../../assets/icons/icon-logo.svg';
import PoweredGelato from '../../assets/icons/icon-gelato-header.svg';
import Networks from './Networks';
import { Account } from './Account';
import { useAccount, useNetwork } from 'wagmi';
import { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { supportedChains } from '../../blockchain/constants';

export default function Header() {
    const { isConnected } = useAccount();
    const { nftId, collectiveProfile } = useContext(AppContext);
    const { chain } = useNetwork();

    const currentChain = supportedChains[chain?.id as number];
    const openSeaUrl = `${currentChain?.openSeaUrl}${currentChain?.nft}/${nftId}`;

    return (
        <header className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex gap-5 items-center">
                <span style={{ backgroundImage: `url('${collectiveProfile.picture}')`}} className={`w-10 h-10 rounded-full bg-center bg-cover`} />
                {collectiveProfile.handle}
            </div>
            <div className="mt-6 md:mt-0 items-center gap-2 md:gap-4 flex">
                {isConnected &&
                  <>
                      {nftId && typeof nftId === 'string' &&
                          'Access Token: #' + nftId
                      }
                      <Account />
                  </>

                }
                <Networks />
            </div>
        </header>
    );
};
