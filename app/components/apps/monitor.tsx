'use client';
import { ChangeEvent, type JSX, useState, useRef, useEffect} from 'react';
import styles from './page.module.css';
import { type RGB, ParseRgb, Rgb2Hex, GetStringifiedCssProperties, ColorChannel, ColorFormat} from '@/utils/color';
import LightBulb from './light-bulb';
import Slider from './slider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faClipboardCheck, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

interface MonitorProps {
    defaultScale?: number;
    defaultRedChannelValue?: number;
    defaultGreenChannelValue?: number;
    defaultBlueChannelValue?: number;
    defaultBloomIntensity?: number;
    defaultColorFormat?: ColorFormat;
}

export default function Monitor({defaultScale = 10, defaultRedChannelValue = 0, defaultGreenChannelValue = 0, defaultBlueChannelValue = 0, defaultBloomIntensity = 1.0, defaultColorFormat = ColorFormat.Hex}: MonitorProps): JSX.Element {
    const [scale, setScale] = useState<number>(defaultScale);
    const [redChannelValue, setRedChannelValue] = useState<number>(defaultRedChannelValue);
    const [greenChannelValue, setGreenChannelValue] = useState<number>(defaultGreenChannelValue);
    const [blueChannelValue, setBlueChannelValue] = useState<number>(defaultBlueChannelValue);
    const [bloomIntensity, setBloomIntensity] = useState<number>(defaultBloomIntensity);
    const [colorFormat, setColorFormat] = useState<ColorFormat>(defaultColorFormat);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isBackgroundMusicPaused, setIsBackgroundMusicPaused] = useState<boolean>(true);
    const [isTimeout, setIsTimeout] = useState<boolean>(true);
    const [colorChannel, setColorChannel] = useState<ColorChannel>(ColorChannel.Red);
    const [isRedChannelReversed, setIsRedChannelReversed] = useState<boolean>(false);
    const [isGreenChannelReversed, setIsGreenChannelReversed] = useState<boolean>(false);
    const [isBlueChannelReversed, setIsBlueChannelReversed] = useState<boolean>(false);
    const [isBloomIntensityReversed, setIsBloomIntensityReversed] = useState<boolean>(false);
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !backgroundMusicRef.current) {
            backgroundMusicRef.current = new Audio('/sounds/chill.ogg');
            backgroundMusicRef.current.loop = true;
        }

        if (!isBackgroundMusicPaused) {
            setTimeout(() => {
                if (isTimeout) {
                    setIsTimeout(false);
                    setColorChannel(Math.floor(Math.random() * 3));
                    setTimeout(() => setIsTimeout(true), 1000);
                }
                
                switch (colorChannel) {
                    case ColorChannel.Red:
                        if (!isRedChannelReversed) {
                            if (redChannelValue + 5 <= 255) {
                                setRedChannelValue(redChannelValue + 5);
                            } else {
                                setIsRedChannelReversed(true);
                            }
                        } else {
                            if (redChannelValue - 5 >= 0) {
                                setRedChannelValue(redChannelValue - 5);
                            } else {
                                setIsRedChannelReversed(false);
                            }                            
                        }
                        break;
                    case ColorChannel.Green:
                        if (!isGreenChannelReversed) {
                            if (greenChannelValue + 5 <= 255) {
                                setGreenChannelValue(greenChannelValue + 5);
                            } else {
                                setIsGreenChannelReversed(true);
                            }
                        } else {
                            if (greenChannelValue - 5 >= 0) {
                                setGreenChannelValue(greenChannelValue - 5);
                            } else {
                                setIsGreenChannelReversed(false);
                            }                            
                        }
                        break;
                    case ColorChannel.Blue:
                        if (!isBlueChannelReversed) {
                            if (blueChannelValue + 5 <= 255) {
                                setBlueChannelValue(blueChannelValue + 5);
                            } else {
                                setIsBlueChannelReversed(true);
                            }
                        } else {
                            if (blueChannelValue - 5 >= 0) {
                                setBlueChannelValue(blueChannelValue - 5);
                            } else {
                                setIsBlueChannelReversed(false);
                            }
                        }
                        break;
                }
                if (!isBloomIntensityReversed) {
                    if (bloomIntensity + 0.1 <= 1) {
                        setBloomIntensity(+(bloomIntensity + 0.1).toFixed(2));
                    } else {
                        setIsBloomIntensityReversed(true);
                    }
                }
                else {
                    if (bloomIntensity - 0.1 >= 0) {
                        setBloomIntensity(+(bloomIntensity - 0.1).toFixed(2));
                    } else {
                        setIsBloomIntensityReversed(false);
                    }
                }
            }, 50);
        }
    });

    function GetRgb(): RGB {
        return [redChannelValue, greenChannelValue, blueChannelValue];
    }

    function PlayBackgroundMusic() {
        const backgroundMusic: HTMLAudioElement | null = backgroundMusicRef.current;

        if (!backgroundMusic) return;

        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.currentTime = 0;
            backgroundMusic.pause();
        }

        setIsBackgroundMusicPaused(backgroundMusic.paused);
    }

    return (
    <>
        <div className={styles.monitor}>
            <h1 className={styles.title}>Monitor</h1>
            <LightBulb color={Rgb2Hex(GetRgb())} scale={scale} bloomIntensity={bloomIntensity}/>
        </div>
        <table className={styles.settings}>
            <tbody>
                <Slider name='SCALE' minValue={1} maxValue={10} value={scale} callback={(value: number) => setScale(value)}/>
                <Slider name='RED' minValue={0} maxValue={255} value={redChannelValue} callback={(value: number) => setRedChannelValue(value)}/>
                <Slider name='GREEN' minValue={0} maxValue={255} value={greenChannelValue} callback={(value: number) => setGreenChannelValue(value)}/>
                <Slider name='BLUE' minValue={0} maxValue={255} value={blueChannelValue} callback={(value: number) => setBlueChannelValue(value)}/>
                <Slider name='BLOOM INTENSITY' minValue={0} maxValue={1} step={0.1} value={bloomIntensity} callback={(value: number) => setBloomIntensity(value)}/>
            </tbody>
        </table>
        <input className={styles['color-picker']} type='color' value={Rgb2Hex(GetRgb())} onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const [r, g, b]: RGB = ParseRgb(event.currentTarget.value) as RGB;

            setRedChannelValue(r);
            setGreenChannelValue(g);
            setBlueChannelValue(b);
        }}/>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{display: 'flex'}}>
                <button className={styles['copy-button']} onClick={() => {
                    setIsCopied(true);
                    navigator.clipboard.writeText(GetStringifiedCssProperties(GetRgb(), scale, bloomIntensity, colorFormat));
                    if (!isCopied) {
                        setTimeout(() => {setIsCopied(false);}, 3000);
                    }
                }}>
                    {isCopied ? 'COPIED' : 'COPY'} <FontAwesomeIcon icon={isCopied ? faClipboardCheck : faClipboard}/>
                </button>
                <button className={styles['color-format-switcher']} onClick={() => {
                    if (colorFormat + 1 < Object.keys(ColorFormat).filter(key => isNaN(Number(key))).length) setColorFormat(colorFormat + 1);
                    else setColorFormat(0);
                }}>
                    {ColorFormat[colorFormat]}
                </button>
            </div>
            <button onClick={PlayBackgroundMusic} style={{height: '2rem', aspectRatio: 1, border: 'none', borderRadius: '50%'}}>
                <FontAwesomeIcon icon={isBackgroundMusicPaused ? faPlay : faPause}/>
            </button>
        </div>
    </>
    );
}