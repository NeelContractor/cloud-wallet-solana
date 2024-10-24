"use server"
import { hashPassword, verifyPassword } from '@/utils/bcrypt';
import client from './../db';
import { generateKeypair } from '@/utils/GenerateKeypair';

export async function signup(email: string, password: string) {
    let passwd = await hashPassword(password);

    const keypair = generateKeypair();

    try {
        const user = await client.user.create({
            data: {
                email: email,
                password: passwd,
                publicKey: keypair.publicKey,
                privateKey: keypair.privateKey,
            }
        });
        return user;
    } catch (e) {
        console.log("Error dashboard: ", e);
        return false;
    }
}

export async function signin(email: string, password: string) {
    try {
        const user = await client.user.findFirst({
            where: { email }
        });

        if (!user) {
            throw new Error('User not found.');
        }

        // Verify the input password with the hashed password from the database
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }
        return user;
    } catch (error) {
        console.error('Signin error:', error);
        return false;
    }
}
