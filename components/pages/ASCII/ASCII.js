import cx from 'classnames';
import PropTypes from 'prop-types';

import { dec, hex, bin } from 'utils';

import Head from 'components/misc/Head';
import Header from 'components/ui/Header';

import styles from './ASCII.module.scss';

const TYPE_CONTROL = 'control';
const TYPE_SPECIAL = 'special';
const TYPE_NUMBER = 'number';
const TYPE_UPPER = 'upper';
const TYPE_LOWER = 'lower';

const special = [
    { value: 0, label: 'NUL', description: 'Null' },
    { value: 1, label: 'SOH', description: 'Start Of Heading' },
    { value: 2, label: 'STX', description: 'Start Of Text' },
    { value: 3, label: 'ETX', description: 'End Of Text' },
    { value: 4, label: 'EOT', description: 'End Of Transmission' },
    { value: 5, label: 'ENQ', description: 'Enquiry' },
    { value: 6, label: 'ACK', description: 'Acknowledge' },
    { value: 7, label: 'BEL', description: 'Bell' },
    { value: 8, label: 'BS', description: 'Backspace' },
    { value: 9, label: 'TAB', description: 'Horizontal Tab' },
    { value: 10, label: 'LF', description: 'Line Feed' },
    { value: 11, label: 'VT', description: 'Vertical Tab' },
    { value: 12, label: 'FF', description: 'Form Feed' },
    { value: 13, label: 'CR', description: 'Carriage Return' },
    { value: 14, label: 'SO', description: 'Shift Out' },
    { value: 15, label: 'SI', description: 'Shift In' },
    { value: 16, label: 'DLE', description: 'Data Link Escape' },
    { value: 17, label: 'DC1', description: 'Device Control 1' },
    { value: 18, label: 'DC2', description: 'Device Control 2' },
    { value: 19, label: 'DC3', description: 'Device Control 3' },
    { value: 20, label: 'DC4', description: 'Device Control 4' },
    { value: 21, label: 'NAK', description: 'Negative Acknowledge' },
    { value: 22, label: 'SYN', description: 'Synchronous Idle' },
    { value: 23, label: 'ETB', description: 'End Of Transmission Block' },
    { value: 24, label: 'CAN', description: 'Cancel' },
    { value: 25, label: 'EM', description: 'End Of Medium' },
    { value: 26, label: 'SUB', description: 'Substitute' },
    { value: 27, label: 'ESC', description: 'Escape' },
    { value: 28, label: 'FS', description: 'File Separator' },
    { value: 29, label: 'GS', description: 'Group Separator' },
    { value: 30, label: 'RS', description: 'Record Separator' },
    { value: 31, label: 'US', description: 'Unit Separator' },
    { value: 32, label: 'SPC', description: 'Space', printable: true },
    { value: 127, label: 'DEL', description: 'Delete' },
];

const getSpecial = num => special.find(({ value }) => value === num);

const getType = num => {
    if (num <= 0x1f || num === 0x7f) {
        return TYPE_CONTROL;
    } else if (num >= 0x30 && num <= 0x39) {
        return TYPE_NUMBER;
    } else if (num >= 0x41 && num <= 0x5a) {
        return TYPE_UPPER;
    } else if (num >= 0x61 && num <= 0x7a) {
        return TYPE_LOWER;
    }
    return TYPE_SPECIAL;
};

const ASCIIPage = ({ fontsLoaded }) => {
    const rootStyle = cx(styles.root, {
        [styles['root-isHidden']]: !fontsLoaded,
    });
    return (
        <div className={rootStyle}>
            <Head
                title="∩The∩∩∩ASCII∩∩∩Device∩∩∩∩∩∩"
                description="ASCII Table"
                url="https://thedoor.dev/ascii"
            />
            <main className={styles.main}>
                <Header title="The ASCII Device" />
                <div className={styles.table}>
                    {new Array(8).fill(0).map((_, i) => (
                        <Block key={i} i={i} />
                    ))}
                </div>
            </main>
        </div>
    );
};

const Block = ({ i }) => (
    <div className={cx(styles.block)}>
        {new Array(16).fill(0).map((_, j) => (
            <Row key={j} i={i * 16 + j} />
        ))}
    </div>
);

Block.propTypes = {
    i: PropTypes.number.isRequired,
};

const Row = ({ i }) => {
    const formatBin = i => {
        const str = bin(i);
        const high = i === 0 ? 1 : 1 + Math.floor(Math.log2(i));
        return (
            <>
                <span className={styles.dimmed}>
                    {str.substring(0, 8 - high)}
                </span>
                {str.substring(8 - high)}
            </>
        );
    };
    const formatAsc = i => {
        const str = getSpecial(i)?.label ?? String.fromCharCode(i);
        return str.padEnd(3, ' ');
    };
    return (
        <div className={cx(styles.row, styles[getType(i)])}>
            <span className={cx(styles.col, styles.dec)}>{dec(i)}</span>
            <span className={cx(styles.col, styles.hex)}>{hex(i)}</span>
            <span className={cx(styles.col, styles.bin)}>{formatBin(i)}</span>
            <span className={cx(styles.col, styles.asc)}>{formatAsc(i)}</span>
        </div>
    );
};

Row.propTypes = {
    i: PropTypes.number.isRequired,
};

export default ASCIIPage;
