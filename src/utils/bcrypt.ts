import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;


export const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        return hashed;
    } catch (e) {
        console.error('Error hashing password:', e);
        throw new Error('Hashing failed');
    }
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch
    } catch (e) {
        console.error('Error verifying password:', e);
        throw new Error('Password verification failed');
    }
}

