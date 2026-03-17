// src/components/ui/Spinner.jsx
import './Spinner.css';

const SIZE_MAP = { sm: 20, md: 32, lg: 48 };
const BORDER_MAP = { sm: 2, md: 3, lg: 4 };

export default function Spinner({ size = 'md', color = 'var(--primary)' }) {
    const px = SIZE_MAP[size] ?? SIZE_MAP.md;
    const bw = BORDER_MAP[size] ?? BORDER_MAP.md;
    return (
        <div
            className="ui-spinner"
            style={{
                width: px,
                height: px,
                borderWidth: bw,
                borderTopColor: color,
            }}
            aria-hidden="true"
        />
    );
}
