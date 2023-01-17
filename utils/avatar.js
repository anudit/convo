
import { createAvatar } from "@dicebear/core";
import { micah } from '@dicebear/collection';

export const getAvatar = (seed, config = {}) => {

    let svg = createAvatar(micah, {
        seed,
        mouth: ['laughing', 'smile'],
        ...config
        // ... and other options
    });

    return `data:image/svg+xml,${encodeURIComponent(svg.toString())}`;
};

export default getAvatar;
