import { RectangleBounds } from "../components/Primitives/Rectangle/RectangleBounds";
import { Sprite, SpriteOptions } from "../components/Primitives/Sprite/Sprite";
import { SpriteLoaderFunction, MultiSpriteLoaderFunction } from "../components/Primitives/Sprite/SpriteLoader";
import { LoadedTexture } from "../components/Primitives/Texture/loadedTexture";
import { Texture } from "../components/Primitives/Texture/texture";

export const genericSpriteLoader = (
    id: string,
    url: string
): SpriteLoaderFunction => {
    return async () => {
        const texture = new Texture();
        await texture.load(url);
        const lT = new LoadedTexture(texture, id);
        return new Sprite(lT, {
            source: new RectangleBounds(0, 0, texture.width, texture.height),
        });
    };
};

export const genericMultiSpriteLoader = (
    urls: Record<string, string>,
    options?: SpriteOptions
): MultiSpriteLoaderFunction => {
    return async (id: string) => {
        const texture = new Texture();
        const url = urls[id];
        if(!url) throw "Url not present!"
        await texture.load(url);
        const lT = new LoadedTexture(texture, id);
        return new Sprite(lT, {
            source: new RectangleBounds(0, 0, texture.width, texture.height),
            ...options,
        });
    };
};
