import UiIcon from './UiIcon';
import { CountTimer } from './CountTimer';
import { supportedChains } from '../../blockchain/constants';
import { useNetwork } from 'wagmi';

export function KoruBox(props: any) {
    const { chain } = useNetwork();

    const statsMap: any = [
        {
            key: 'totalAmountOfComments',
            icon: 'comment',
            color: '#4085F3',
        },
        {
            key: 'totalAmountOfMirrors',
            icon: 'mirror',
            color: '#8B62F3',
        },
        {
            key: 'totalAmountOfCollects',
            icon: 'collect',
            color: '#ED4649',
        },
    ];

    const chainId: number = chain?.id && [137, 80001].includes(Number(chain?.id)) ? chain.id : 137;

    const ipfsPicURL: string = props.publication.profile.picture.original.url;
    const picHash: string = ipfsPicURL.replace('ipfs://', '');
    const profilePic: string = `https://cloudflare-ipfs.com/ipfs/${picHash}`;

    return (
        <a href={`${supportedChains[chainId]?.lensProfileUrl}/posts/${props.publication.id}`}
           target="_blank">
            <div className="koru-box !p-6">
                <div className="flex gap-4">
                    <img src={profilePic} className="rounded-full w-12 h-12 inline-block" alt={`${props.publication.profile.name} profile picture`} />
                    <div className="w-full">
                        <div className="flex justify-between">
                            <div>
                                <h1 className="font-medium">
                                    {props.publication.profile.name}
                                </h1>
                                <p className="koru-gradient-text-1 inline-block font-medium">
                                    @{props.publication.profile.handle}
                                </p>
                            </div>
                            <div className="text-sm opacity-40">
                                <CountTimer timestamp={props.timestamp} /> ago
                            </div>
                        </div>
                        <div>
                            {props.content}
                        </div>
                        <div>
                            <ul className="flex gap-8 mt-6">
                                {statsMap.map((stat: any) => (
                                    <li key={stat.key}
                                        className="flex gap-2 text-sm"
                                        style={{ color: stat.color }}
                                    >
                                        <UiIcon icon={stat.icon} classes="w-5 h-5" /> {props.publication.stats[stat.key]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}
