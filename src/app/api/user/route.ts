'use server';

import { NextResponse } from "next/server";
import { User, Device } from "@/database/schemas";
import { createSession } from "./session";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();
    const user = await User.exists({ username: data.username });

    if (user !== null) {
        // Username is already taken
        // TODO: this allows username enumeration
        // this could be prevented by generating usernames randomly
        return NextResponse.json({}, {
            status: 409
        });
    }

    // Create a new device and attach to new user
    const newDevice = new Device({ deviceWrappedVaultKey: data.deviceWrappedVaultKey });
    const newUser = new User({
        username: data.username,
        devices: [newDevice],
        sessions: [],
        authenticators: [],
        passphraseResetAllowed: true
    });

    await newUser.save();
    await newDevice.save();
    await createSession(newUser._id);

    return NextResponse.json({
        'deviceId': newDevice._id
    }, {
        status: 201
    });
}
