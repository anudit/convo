
import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/micah";

export const getAvatar = (seed, config = {}) => {

    let svg = createAvatar(style, {
        seed,
        ...config
        // ... and other options
    });

    return svg;
};

export default getAvatar;
