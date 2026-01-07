import * as crypto from 'crypto';

export const generateSecretHash = (
    username: string,
    clientSecret: string,
    clientId: string,
): string => {
    const message = username + clientId;
    return crypto
        .createHmac('sha256', clientSecret)
        .update(message)
        .digest('base64');
};
