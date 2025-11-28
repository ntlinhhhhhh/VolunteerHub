import { Token } from "./token.entity";

export class AuthToken extends Token {
    constructor(
        public readonly accessToken: string,
        public readonly refreshToken: string,
        public readonly expiresIn: number,
        public readonly authId: string,
    ) {
        super(accessToken, refreshToken, expiresIn);
    }
}